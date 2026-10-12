var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConnectionsTableService } from '../cables/connections-table.service.js';
const MAX_STEPS = 500;
let TraceService = class TraceService {
    prisma;
    connectionsTable;
    constructor(prisma, connectionsTable) {
        this.prisma = prisma;
        this.connectionsTable = connectionsTable;
    }
    async traceDevice(type, id) {
        const ctx = new TraceContext(this.prisma, this.connectionsTable);
        const kind = await ctx.kindOf(type, id);
        if (!kind)
            throw new NotFoundException('Dispositivo no encontrado');
        const origin = await ctx.device(kind, id);
        if (!origin)
            throw new NotFoundException('Dispositivo no encontrado');
        const table = await this.connectionsTable.build(kind, id, kind === 'ODF' ? await ctx.odfCapacity(id) : null);
        const fibers = [];
        for (const cable of table.cables) {
            for (const buffer of cable.buffers) {
                for (const fiber of buffer.fibers) {
                    ctx.rememberFiber({ id: fiber.id, cableId: cable.cableId, cableCode: cable.code, number: fiber.number, color: fiber.color });
                    fibers.push({
                        fiberId: fiber.id,
                        cableId: cable.cableId,
                        cableCode: cable.code,
                        number: fiber.number,
                        color: fiber.color,
                        status: fiber.status,
                        service: fiber.service,
                        steps: await ctx.traceFiber(origin, fiber.id),
                    });
                }
            }
        }
        return { device: { kind, id, name: origin.name }, fibers };
    }
};
TraceService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService, ConnectionsTableService])
], TraceService);
export { TraceService };
class TraceContext {
    prisma;
    table;
    devices = new Map();
    stops = new Map();
    fibers = new Map();
    constructor(prisma, table) {
        this.prisma = prisma;
        this.table = table;
    }
    async kindOf(type, id) {
        if (type === 'odf') {
            const odf = await this.prisma.odf.findUnique({ where: { id }, select: { deletedAt: true } });
            return odf && !odf.deletedAt ? 'ODF' : null;
        }
        const box = await this.prisma.box.findUnique({ where: { id }, select: { type: true, deletedAt: true } });
        return box && !box.deletedAt && (box.type === 'MANGA' || box.type === 'NAP') ? box.type : null;
    }
    async odfCapacity(id) {
        return (await this.prisma.odf.findUnique({ where: { id }, select: { capacity: true } }))?.capacity ?? null;
    }
    rememberFiber(fiber) {
        this.fibers.set(fiber.id, fiber);
    }
    device(kind, id) {
        const key = `${kind}:${id}`;
        if (!this.devices.has(key))
            this.devices.set(key, this.loadDevice(kind, id));
        return this.devices.get(key);
    }
    async loadDevice(kind, id) {
        if (kind === 'ODF') {
            const odf = await this.prisma.odf.findUnique({ where: { id }, select: { code: true, name: true, capacity: true, deletedAt: true } });
            if (!odf || odf.deletedAt)
                return null;
            const sheet = await this.table.build('ODF', id, odf.capacity);
            return { kind, id, name: odf.name || odf.code, terminals: sheet.terminals };
        }
        const box = await this.prisma.box.findUnique({ where: { id }, select: { code: true, name: true, type: true, deletedAt: true } });
        if (!box || box.deletedAt || (box.type !== 'MANGA' && box.type !== 'NAP'))
            return null;
        const sheet = await this.table.build(box.type, id);
        return { kind: box.type, id, name: box.name || box.code, terminals: sheet.terminals };
    }
    cableStops(cableId) {
        if (!this.stops.has(cableId)) {
            this.stops.set(cableId, this.prisma.cableConnection.findMany({
                where: { cableId, cable: { deletedAt: null } },
                orderBy: { sequence: 'asc' },
                select: { elementType: true, elementId: true, sequence: true, fiberFrom: true, fiberTo: true },
            }));
        }
        return this.stops.get(cableId);
    }
    async fiber(id) {
        const known = this.fibers.get(id);
        if (known)
            return known;
        const fiber = await this.prisma.fiber.findUnique({
            where: { id },
            select: { id: true, number: true, color: true, deletedAt: true, cable: { select: { cableId: true, cable: { select: { code: true } } } } },
        });
        if (!fiber || fiber.deletedAt)
            return null;
        const info = { id: fiber.id, cableId: fiber.cable.cableId, cableCode: fiber.cable.cable.code, number: fiber.number, color: fiber.color };
        this.fibers.set(id, info);
        return info;
    }
    partners(device, fiberId) {
        const terminal = device.terminals.find((t) => t.fibers.some((f) => f.fiberId === fiberId));
        if (!terminal)
            return { terminal: null, partners: [] };
        const related = new Set([terminal]);
        for (const peer of terminal.peers) {
            const match = device.terminals.find((t) => t.label === peer);
            if (match)
                related.add(match);
        }
        const [portType] = terminal.key.split(':');
        if (portType === 'SPLITTER_INPUT' || portType === 'SPLITTER_OUTPUT') {
            const otherSide = portType === 'SPLITTER_INPUT' ? 'SPLITTER_OUTPUT' : 'SPLITTER_INPUT';
            for (const t of device.terminals)
                if (t.group === terminal.group && t.key.startsWith(`${otherSide}:`))
                    related.add(t);
        }
        const partners = [...related].flatMap((t) => t.fibers.filter((f) => f.fiberId !== fiberId).map((f) => ({ fiberId: f.fiberId, terminal: t })));
        return { terminal, partners };
    }
    async traceFiber(origin, fiberId) {
        const steps = [];
        const visited = new Set();
        const start = await this.fiber(fiberId);
        if (!start)
            return steps;
        const addStep = (parent, how, device, fiber, portLabel) => {
            const step = {
                id: steps.length,
                parent,
                how,
                deviceType: device.kind,
                deviceId: device.id,
                deviceName: device.name,
                portLabel,
                fiberId: fiber.id,
                cableId: fiber.cableId,
                cableCode: fiber.cableCode,
                fiberNumber: fiber.number,
                fiberColor: fiber.color,
            };
            steps.push(step);
            return step;
        };
        const travel = async (fiber, device, parent, direction) => {
            const along = (await this.cableStops(fiber.cableId)).filter((s) => fiber.number >= s.fiberFrom && fiber.number <= s.fiberTo);
            const here = along.findIndex((s) => s.elementType === device.kind && s.elementId === device.id);
            if (here < 0)
                return;
            for (const offset of direction ? [direction] : [-1, 1]) {
                const next = along[here + offset];
                if (!next)
                    continue;
                const key = `${fiber.id}@${next.elementType}:${next.elementId}`;
                if (visited.has(key) || steps.length >= MAX_STEPS)
                    continue;
                visited.add(key);
                const nextDevice = await this.device(next.elementType, next.elementId);
                if (!nextDevice)
                    continue;
                const { terminal } = this.partners(nextDevice, fiber.id);
                const step = addStep(parent, 'cable', nextDevice, fiber, terminal?.label ?? null);
                await arrive(fiber, nextDevice, step.id, offset);
            }
        };
        const arrive = async (fiber, device, parent, direction) => {
            const mappings = device.terminals.filter((t) => t.key.startsWith('MAPPING:'));
            if (direction && mappings.length) {
                const from = direction === 1 ? 0 : 1;
                const to = 1 - from;
                const mapping = mappings.find((t) => t.fibers[from]?.fiberId === fiber.id);
                if (mapping) {
                    const partnerId = mapping.fibers[to]?.fiberId;
                    const next = partnerId ? await this.fiber(partnerId) : null;
                    if (!next || steps.length >= MAX_STEPS)
                        return;
                    visited.add(`${next.id}@${device.kind}:${device.id}`);
                    const step = addStep(parent, 'splice', device, next, mapping.label);
                    await travel(next, device, step.id, direction);
                    return;
                }
                if (mappings.some((t) => t.fibers[to]?.fiberId === fiber.id))
                    return;
            }
            const { terminal, partners } = this.partners(device, fiber.id);
            if (!terminal) {
                await travel(fiber, device, parent, direction);
                return;
            }
            for (const partner of partners) {
                const key = `${partner.fiberId}@${device.kind}:${device.id}`;
                if (visited.has(key) || steps.length >= MAX_STEPS)
                    continue;
                visited.add(key);
                const next = await this.fiber(partner.fiberId);
                if (!next)
                    continue;
                const step = addStep(parent, 'splice', device, next, partner.terminal.label);
                await travel(next, device, step.id);
            }
        };
        visited.add(`${start.id}@${origin.kind}:${origin.id}`);
        const { terminal } = this.partners(origin, start.id);
        const first = addStep(null, 'origin', origin, start, terminal?.label ?? null);
        const startsAtMapping = origin.terminals.some((t) => t.key.startsWith('MAPPING:') && t.fibers[0]?.fiberId === start.id);
        await travel(start, origin, first.id, startsAtMapping ? -1 : undefined);
        await arrive(start, origin, first.id, startsAtMapping ? 1 : undefined);
        return steps;
    }
}
//# sourceMappingURL=trace.service.js.map