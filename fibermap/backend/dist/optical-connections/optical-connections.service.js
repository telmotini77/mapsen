var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isNormalManga } from '../domain/network-rules.js';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OpticalTopologyValidatorService } from '../optical-topology-validator/optical-topology-validator.service.js';
import { ConnectionsTableService, MAX_FIBERS_PER_PORT, boxPortLabel, splitterPortNumber } from '../cables/connections-table.service.js';
export const FIBER_ENTITY = 'FIBER';
const CONNECTION_INCLUDE = {
    sourceTermination: true,
    targetTermination: true,
    sourceFiber: { select: { id: true, number: true, color: true, label: true } },
    targetFiber: { select: { id: true, number: true, color: true, label: true } },
};
let OpticalConnectionsService = class OpticalConnectionsService {
    prisma;
    topologyValidator;
    connectionsTable;
    constructor(prisma, topologyValidator, connectionsTable) {
        this.prisma = prisma;
        this.topologyValidator = topologyValidator;
        this.connectionsTable = connectionsTable;
    }
    async assignCablePorts(cableId) {
        const stops = await this.prisma.cableConnection.findMany({ where: { cableId }, orderBy: { sequence: 'asc' } });
        for (const stop of stops) {
            const descriptions = [];
            const deviceType = stop.elementType;
            const isOdf = deviceType === 'ODF';
            const device = isOdf
                ? await this.prisma.odf.findUnique({ where: { id: stop.elementId } })
                : await this.prisma.box.findUnique({ where: { id: stop.elementId } });
            if (!device || device.deletedAt)
                continue;
            if ('mangaType' in device && isNormalManga(device.mangaType)) {
                await this.assignNormalSplices(stop);
                continue;
            }
            const numbers = new Set([stop.fiberFrom]);
            const index = stops.indexOf(stop);
            for (const neighbor of [stops[index - 1], stops[index + 1]]) {
                if (neighbor && neighbor.fiberFrom >= stop.fiberFrom && neighbor.fiberFrom <= stop.fiberTo)
                    numbers.add(neighbor.fiberFrom);
            }
            for (const number of numbers) {
                const fiber = await this.prisma.fiber.findFirst({ where: { cable: { cableId }, number, deletedAt: null } });
                if (!fiber)
                    throw new BadRequestException(`No existe el hilo ${number}.`);
                const scope = isOdf ? { odfId: stop.elementId } : { boxId: stop.elementId };
                const existing = await this.prisma.opticalConnection.findFirst({ where: { deletedAt: null, sourceTermination: { entityType: FIBER_ENTITY, entityId: fiber.id, ...scope } } });
                if (existing)
                    continue;
                const sheet = await this.connectionsTable.build(deviceType, stop.elementId, device.capacity);
                const eligible = sheet.terminals.filter((t) => !t.key.startsWith('SPLITTER_INPUT:'));
                const available = eligible.find((t) => t.fibers.length === 0 && t.status === 'FREE')
                    ?? eligible.find((t) => t.fibers.length > 0 && t.fibers.length < MAX_FIBERS_PER_PORT);
                let terminalKey = available?.key;
                if (!terminalKey && !isOdf) {
                    const ports = await this.prisma.boxPort.findMany({ where: { boxId: stop.elementId }, select: { number: true } });
                    const used = new Set(ports.map((p) => p.number));
                    const freeNumber = Array.from({ length: device.capacity ?? 1 }, (_, i) => i + 1).find((n) => !used.has(n));
                    if (freeNumber) {
                        const port = await this.prisma.boxPort.create({ data: { boxId: stop.elementId, number: freeNumber, type: 'EMPALME' } });
                        terminalKey = `BOX_PORT:${port.id}`;
                    }
                }
                if (!terminalKey)
                    throw new ConflictException(`${device.code} no tiene puertos disponibles para el hilo ${number}.`);
                const connection = await this.createFiberLink({ deviceType, deviceId: stop.elementId, fiberId: fiber.id, terminalKey });
                const description = `Conexión automática: hilo ${number} → ${available?.label ?? 'Puerto de empalme'} de ${device.code}.`;
                descriptions.push(description);
                await this.prisma.opticalConnection.update({ where: { id: connection.id }, data: { notes: description } });
            }
            if (descriptions.length && !stop.notes) {
                await this.prisma.cableConnection.update({ where: { id: stop.id }, data: { notes: descriptions.join(' ') } });
            }
        }
    }
    async assignNormalSplices(stop) {
        const others = await this.prisma.cableConnection.findMany({
            where: { elementId: stop.elementId, elementType: 'MANGA', cableId: { not: stop.cableId }, cable: { deletedAt: null } },
            orderBy: { cable: { createdAt: 'asc' } },
        });
        for (let number = stop.fiberFrom; number <= stop.fiberTo; number++) {
            const fiber = await this.prisma.fiber.findFirst({ where: { cable: { cableId: stop.cableId }, number, deletedAt: null } });
            if (!fiber)
                continue;
            const isUsed = async (id) => !!await this.prisma.opticalConnection.findFirst({
                where: { deletedAt: null, OR: [
                        { sourceTermination: { entityType: { in: ['FIBER', 'FIBER_IN', 'FIBER_OUT'] }, entityId: id, boxId: stop.elementId } },
                        { targetTermination: { entityType: { in: ['FIBER', 'FIBER_IN', 'FIBER_OUT'] }, entityId: id, boxId: stop.elementId } },
                    ] },
            });
            if (await isUsed(fiber.id))
                continue;
            for (const other of others) {
                if (number < other.fiberFrom || number > other.fiberTo)
                    continue;
                if (stop.role === 'START' && other.role === 'START')
                    continue;
                if (stop.role === 'END' && other.role === 'END')
                    continue;
                const peer = await this.prisma.fiber.findFirst({ where: { cable: { cableId: other.cableId }, number, deletedAt: null } });
                if (!peer || await isUsed(peer.id))
                    continue;
                const sourceId = stop.role === 'START' ? peer.id : fiber.id;
                const targetId = stop.role === 'START' ? fiber.id : peer.id;
                await this.create({ boxId: stop.elementId, sourceType: FIBER_ENTITY, sourceId, targetType: FIBER_ENTITY, targetId,
                    connectionType: 'SPLICE', notes: `Empalme automático: hilo ${number} de entrada con hilo ${number} de salida.` });
                break;
            }
        }
    }
    async setNormalMapping(dto) {
        return this.prisma.$transaction(async (tx) => {
            const box = await tx.box.findUnique({ where: { id: dto.boxId } });
            if (!box || box.deletedAt || box.type !== 'MANGA' || !isNormalManga(box.mangaType))
                throw new BadRequestException('Solo las mangas normales, de paso y de empalme permiten cambiar la salida.');
            const [input, output] = await Promise.all([
                tx.fiber.findUnique({ where: { id: dto.sourceFiberId } }),
                tx.fiber.findUnique({ where: { id: dto.targetFiberId } }),
            ]);
            if (!input || !output || input.deletedAt || output.deletedAt)
                throw new BadRequestException('El hilo seleccionado no existe.');
            const stops = await tx.cableConnection.findMany({ where: { elementId: box.id, elementType: 'MANGA', cable: { deletedAt: null } } });
            const incoming = stops.find((stop) => stop.cableId === input.cableId);
            const outgoing = stops.find((stop) => stop.cableId === output.cableId);
            if (!incoming || !outgoing)
                throw new BadRequestException('Ambas fibras deben pasar por esta manga.');
            if (incoming.role === 'START' || outgoing.role === 'END')
                throw new BadRequestException('Selecciona un hilo de entrada y un hilo de salida.');
            const active = await tx.opticalConnection.findMany({ where: {
                    deletedAt: null, sourceTermination: { boxId: box.id, entityType: { in: ['FIBER', 'FIBER_IN'] } },
                    targetTermination: { entityType: { in: ['FIBER', 'FIBER_OUT'] } },
                } });
            const current = active.find((link) => link.sourceFiberId === input.id);
            const occupied = active.find((link) => link.targetFiberId === output.id && link.sourceFiberId !== input.id);
            const implicitOutputFree = incoming.role === 'PASS' && !active.some((link) => link.targetFiberId === input.id);
            const previousOutput = current?.targetFiberId ?? (implicitOutputFree ? input.id : null);
            let displacedInput = occupied?.sourceFiberId ?? null;
            if (!occupied && outgoing.role === 'PASS' && output.id !== input.id && !active.some((link) => link.sourceFiberId === output.id))
                displacedInput = output.id;
            if (displacedInput && !previousOutput)
                throw new ConflictException('La salida está ocupada. Elige otra salida o asigna primero una salida libre a esta entrada.');
            const ids = [current?.id, occupied?.id].filter((id) => !!id);
            if (ids.length)
                await tx.opticalConnection.updateMany({ where: { id: { in: ids } }, data: { deletedAt: new Date() } });
            const save = async (sourceId, targetId) => {
                const endpoint = async (entityType, entityId) => await tx.opticalTermination.findFirst({ where: { boxId: box.id, entityType, entityId } })
                    ?? await tx.opticalTermination.create({ data: { boxId: box.id, entityType, entityId, type: 'FIBER_END' } });
                const a = await endpoint('FIBER_IN', sourceId);
                const b = await endpoint('FIBER_OUT', targetId);
                return tx.opticalConnection.create({ data: {
                        sourceTerminationId: a.id, targetTerminationId: b.id, sourceFiberId: sourceId, targetFiberId: targetId,
                        connectionType: 'SPLICE', notes: 'Conexión de entrada a salida modificada en la tabla de empalmes.',
                    } });
            };
            const result = await save(input.id, output.id);
            if (displacedInput && previousOutput)
                await save(displacedInput, previousOutput);
            for (const stop of stops) {
                const selected = [input, output].filter((fiber) => fiber.cableId === stop.cableId).map((fiber) => fiber.number);
                if (!selected.length)
                    continue;
                const fiberFrom = Math.min(stop.fiberFrom, ...selected);
                const fiberTo = Math.max(stop.fiberTo, ...selected);
                if (fiberFrom !== stop.fiberFrom || fiberTo !== stop.fiberTo)
                    await tx.cableConnection.update({ where: { id: stop.id }, data: { fiberFrom, fiberTo } });
            }
            return result;
        });
    }
    async resolveTermination(type, entityId, boxId) {
        const existing = await this.prisma.opticalTermination.findFirst({
            where: { entityType: type, entityId, boxId },
        });
        if (existing)
            return existing;
        return this.prisma.opticalTermination.create({
            data: { type: type === FIBER_ENTITY ? 'FIBER_END' : type, entityType: type, entityId, boxId },
        });
    }
    setPortStatus(type, entityId, status) {
        if (['FIBER', 'FIBER_IN', 'FIBER_OUT'].includes(type))
            return Promise.resolve(null);
        if (type === 'ODF_PORT') {
            return this.prisma.odfPort.update({ where: { id: entityId }, data: { status } });
        }
        if (type === 'BOX_PORT') {
            return this.prisma.boxPort.update({ where: { id: entityId }, data: { status } });
        }
        return this.prisma.splitterPort.update({ where: { id: entityId }, data: { status } });
    }
    async createFiberLink(dto) {
        const isOdf = dto.deviceType === 'ODF';
        const device = isOdf
            ? await this.prisma.odf.findUnique({ where: { id: dto.deviceId }, select: { id: true, deletedAt: true } })
            : await this.prisma.box.findUnique({ where: { id: dto.deviceId }, select: { id: true, type: true, deletedAt: true } });
        if (!device || device.deletedAt)
            throw new NotFoundException('Dispositivo no encontrado');
        if (!isOdf) {
            const box = await this.prisma.box.findUnique({ where: { id: dto.deviceId } });
            if (isNormalManga(box?.mangaType))
                throw new BadRequestException('Esta manga conecta hilo con hilo, sin puertos.');
        }
        const fiber = await this.prisma.fiber.findUnique({ where: { id: dto.fiberId }, include: { cable: { include: { cable: { select: { code: true } } } } } });
        if (!fiber || fiber.deletedAt)
            throw new BadRequestException('El hilo no existe');
        const covered = await this.prisma.cableConnection.findFirst({
            where: { cableId: fiber.cable.cableId, elementType: dto.deviceType, elementId: dto.deviceId, cable: { deletedAt: null } },
        });
        if (!covered)
            throw new BadRequestException(`El hilo ${fiber.number} de ${fiber.cable.cable.code} no llega a este dispositivo.`);
        const separator = dto.terminalKey.indexOf(':');
        const portType = dto.terminalKey.slice(0, separator);
        const portRef = dto.terminalKey.slice(separator + 1);
        let portId;
        let portLabel;
        let storedType = portType;
        if (isOdf) {
            const number = Number(portRef);
            if (portType !== 'ODF_PORT' || !Number.isInteger(number) || number < 1)
                throw new BadRequestException('Puerto del ODF no válido');
            const port = await this.prisma.odfPort.upsert({
                where: { odfId_number: { odfId: dto.deviceId, number } },
                create: { odfId: dto.deviceId, number },
                update: {},
            });
            portId = port.id;
            portLabel = `Puerto ${number}`;
        }
        else if (portType === 'BOX_PORT') {
            const port = await this.prisma.boxPort.findUnique({ where: { id: portRef } });
            if (!port || port.deletedAt || port.boxId !== dto.deviceId)
                throw new BadRequestException('El puerto no es de esta caja');
            portId = port.id;
            portLabel = boxPortLabel(port);
        }
        else if (portType === 'BOX_PORT_NUMBER') {
            const number = Number(portRef);
            const box = await this.prisma.box.findUnique({ where: { id: dto.deviceId }, select: { type: true, mangaType: true, capacity: true } });
            if (box?.type !== 'MANGA' || box.mangaType === 'DISTRIBUCION' || !Number.isInteger(number) || number < 1 || number > (box.capacity ?? 0)) {
                throw new BadRequestException('Puerto de empalme no válido');
            }
            const port = await this.prisma.boxPort.upsert({
                where: { boxId_number: { boxId: dto.deviceId, number } },
                create: { boxId: dto.deviceId, number, type: 'EMPALME' },
                update: { deletedAt: null },
            });
            portId = port.id;
            portLabel = boxPortLabel(port);
            storedType = 'BOX_PORT';
        }
        else if (portType === 'SPLITTER_INPUT' || portType === 'SPLITTER_OUTPUT') {
            const port = await this.prisma.splitterPort.findUnique({ where: { id: portRef }, include: { splitter: true } });
            if (!port || port.splitter.deletedAt || port.splitter.boxId !== dto.deviceId)
                throw new BadRequestException('El puerto de splitter no es de esta caja');
            if (port.portType === 'INPUT')
                throw new BadRequestException('El splitter solo usa sus puertos 1 a 8 (o 1 a 16); el puerto común ya no se conecta.');
            portId = port.id;
            portLabel = `${port.splitter.code} · Puerto ${splitterPortNumber(port)}`;
        }
        else {
            throw new BadRequestException('Tipo de puerto no válido');
        }
        const deviceScope = isOdf ? { odfId: dto.deviceId } : { boxId: dto.deviceId };
        const active = await this.prisma.opticalConnection.findMany({
            where: { deletedAt: null, sourceTermination: { entityType: FIBER_ENTITY, ...deviceScope } },
            include: { sourceTermination: true, targetTermination: true, targetFiber: { select: { number: true } } },
        });
        if (active.some((c) => c.sourceTermination.entityId === fiber.id)) {
            throw new ConflictException(`El hilo ${fiber.number} ya está en otro puerto de este dispositivo. Quítalo primero.`);
        }
        const sheet = await this.connectionsTable.build(dto.deviceType, dto.deviceId, isOdf ? (await this.prisma.odf.findUnique({ where: { id: dto.deviceId }, select: { capacity: true } }))?.capacity : null);
        const sheetKey = isOdf ? `ODF_PORT:${Number(portRef)}` : `${storedType}:${portId}`;
        const onPort = sheet.terminals.find((t) => t.key === sheetKey)?.fibers.filter((f) => f.fiberId !== fiber.id) ?? [];
        if (onPort.length >= MAX_FIBERS_PER_PORT) {
            throw new ConflictException(`${portLabel} ya une dos hilos (${onPort.map((f) => `${f.cableCode} hilo ${f.number}`).join(' y ')}). Quita uno primero.`);
        }
        const termination = (entityType, entityId) => this.prisma.opticalTermination.findFirst({ where: { entityType, entityId, ...deviceScope } }).then((existing) => existing ?? this.prisma.opticalTermination.create({ data: { type: entityType === FIBER_ENTITY ? 'FIBER_END' : entityType, entityType, entityId, ...deviceScope } }));
        const [source, target] = await Promise.all([termination(FIBER_ENTITY, fiber.id), termination(storedType, portId)]);
        const connection = await this.prisma.opticalConnection.create({
            data: { sourceTerminationId: source.id, targetTerminationId: target.id, sourceFiberId: fiber.id, targetFiberId: fiber.id, connectionType: 'SPLICE' },
            include: CONNECTION_INCLUDE,
        });
        await this.extendDeviceFiberRange(fiber.cable.cableId, dto.deviceType, dto.deviceId, fiber.number);
        await this.setPortStatus(storedType, portId, 'USED');
        await this.syncBoxOccupancyForTypes([{ type: storedType, entityId: portId }]);
        return connection;
    }
    async extendDeviceFiberRange(cableId, deviceType, deviceId, number) {
        const assignment = await this.prisma.cableConnection.findFirst({
            where: { cableId, elementType: deviceType, elementId: deviceId, cable: { deletedAt: null } },
        });
        if (!assignment || (number >= assignment.fiberFrom && number <= assignment.fiberTo))
            return;
        await this.prisma.cableConnection.update({ where: { id: assignment.id }, data: {
                fiberFrom: Math.min(assignment.fiberFrom, number), fiberTo: Math.max(assignment.fiberTo, number),
            } });
    }
    async syncBoxOccupancyForTypes(references) {
        const boxPortIds = references.filter((reference) => reference.type === 'BOX_PORT').map((reference) => reference.entityId);
        if (boxPortIds.length === 0)
            return;
        const ports = await this.prisma.boxPort.findMany({
            where: { id: { in: boxPortIds } },
            select: { boxId: true },
        });
        const boxIds = [...new Set(ports.map((port) => port.boxId))];
        await Promise.all(boxIds.map(async (boxId) => {
            const usedPorts = await this.prisma.boxPort.count({
                where: { boxId, deletedAt: null, status: { in: ['USED', 'RESERVED'] } },
            });
            return this.prisma.box.update({ where: { id: boxId }, data: { usedPorts } });
        }));
    }
    async assertFiberAtBox(fiberId, box, side) {
        const fiber = await this.prisma.fiber.findUnique({ where: { id: fiberId } });
        if (!fiber || fiber.deletedAt)
            throw new BadRequestException(`El hilo de ${side} no existe`);
        const covered = await this.prisma.cableConnection.findFirst({
            where: { cableId: fiber.cableId, elementType: box.type, elementId: box.id, cable: { deletedAt: null } },
        });
        if (covered)
            return fiber;
        const terminations = await this.prisma.opticalTermination.findMany({ where: { boxId: box.id }, select: { id: true } });
        const assigned = await this.prisma.fiberSegment.findFirst({
            where: {
                fiberId,
                status: 'ACTIVE',
                OR: [{ startTerminationId: { in: terminations.map((t) => t.id) } }, { endTerminationId: { in: terminations.map((t) => t.id) } }],
            },
        });
        if (!assigned)
            throw new BadRequestException(`El hilo ${fiber.number} de ${side} no llega a esta caja: ningún cable conectado a ella lo cubre.`);
        return fiber;
    }
    async create(dto) {
        const box = await this.prisma.box.findUnique({ where: { id: dto.boxId }, select: { id: true, type: true, mangaType: true, deletedAt: true } });
        if (!box || box.deletedAt)
            throw new NotFoundException('Caja no encontrada');
        const direct = dto.sourceType === FIBER_ENTITY || dto.targetType === FIBER_ENTITY;
        if (direct) {
            if (!isNormalManga(box.mangaType) || dto.sourceType !== FIBER_ENTITY || dto.targetType !== FIBER_ENTITY)
                throw new BadRequestException('Los empalmes directos requieren dos hilos en una manga normal, de paso o de empalme.');
            if (dto.sourceId === dto.targetId)
                throw new BadRequestException('Selecciona dos hilos diferentes.');
            dto.sourceFiberId = dto.sourceId;
            dto.targetFiberId = dto.targetId;
            const [a, b] = await Promise.all([this.assertFiberAtBox(dto.sourceId, box, 'entrada'), this.assertFiberAtBox(dto.targetId, box, 'salida')]);
            if (a.cableId === b.cableId)
                throw new BadRequestException('Selecciona hilos de dos fibras distintas.');
        }
        else if (isNormalManga(box.mangaType)) {
            throw new BadRequestException('Esta manga no tiene puertos ni splitters: conecta dos hilos directamente.');
        }
        if (!direct && dto.sourceFiberId)
            await this.assertFiberAtBox(dto.sourceFiberId, box, 'origen');
        if (!direct && dto.targetFiberId)
            await this.assertFiberAtBox(dto.targetFiberId, box, 'destino');
        const source = await this.resolveTermination(dto.sourceType, dto.sourceId, dto.boxId);
        const target = await this.resolveTermination(dto.targetType, dto.targetId, dto.boxId);
        await this.topologyValidator.validateNoCycles(source.id, target.id);
        await this.topologyValidator.validateTerminationAvailability(source.id);
        await this.topologyValidator.validateTerminationAvailability(target.id);
        const connection = await this.prisma.opticalConnection.create({
            data: {
                sourceTerminationId: source.id,
                targetTerminationId: target.id,
                sourceFiberId: dto.sourceFiberId ?? null,
                targetFiberId: dto.targetFiberId ?? null,
                connectionType: dto.connectionType ?? 'SPLICE',
                lossDb: dto.lossDb,
                notes: dto.notes,
            },
            include: CONNECTION_INCLUDE,
        });
        for (const fiberId of new Set([dto.sourceFiberId, dto.targetFiberId].filter((id) => !!id))) {
            const fiber = await this.prisma.fiber.findUnique({ where: { id: fiberId } });
            if (fiber)
                await this.extendDeviceFiberRange(fiber.cableId, box.type, box.id, fiber.number);
        }
        await Promise.all([
            this.setPortStatus(dto.sourceType, dto.sourceId, 'USED'),
            this.setPortStatus(dto.targetType, dto.targetId, 'USED'),
        ]);
        await this.syncBoxOccupancyForTypes([
            { type: dto.sourceType, entityId: dto.sourceId },
            { type: dto.targetType, entityId: dto.targetId },
        ]);
        return connection;
    }
    async findOrCreateTerminationId(entityType, entityId, boxId) {
        if (!['BOX_PORT', 'SPLITTER_INPUT', 'SPLITTER_OUTPUT'].includes(entityType)) {
            throw new BadRequestException('Tipo de terminal no permitido');
        }
        const box = await this.prisma.box.findUnique({ where: { id: boxId } });
        if (!box || box.deletedAt)
            throw new NotFoundException('Caja no encontrada');
        if (entityType === 'BOX_PORT') {
            const port = await this.prisma.boxPort.findUnique({ where: { id: entityId } });
            if (!port || port.deletedAt || port.boxId !== boxId)
                throw new BadRequestException('El puerto de caja seleccionado no es válido');
        }
        else {
            const port = await this.prisma.splitterPort.findUnique({ where: { id: entityId }, include: { splitter: true } });
            if (!port || port.splitter.deletedAt || port.splitter.boxId !== boxId)
                throw new BadRequestException('El puerto de splitter seleccionado no es válido');
        }
        const termination = await this.resolveTermination(entityType, entityId, boxId);
        return { terminationId: termination.id };
    }
    async findAllForBox(boxId) {
        const terminations = await this.prisma.opticalTermination.findMany({
            where: { boxId },
            select: { id: true },
        });
        const terminationIds = terminations.map((t) => t.id);
        if (terminationIds.length === 0)
            return [];
        return this.prisma.opticalConnection.findMany({
            where: {
                deletedAt: null,
                OR: [
                    { sourceTerminationId: { in: terminationIds } },
                    { targetTerminationId: { in: terminationIds } },
                ],
            },
            include: CONNECTION_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const connection = await this.prisma.opticalConnection.findUnique({
            where: { id },
            include: CONNECTION_INCLUDE,
        });
        if (!connection || connection.deletedAt)
            throw new NotFoundException('Conexión no encontrada');
        return connection;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.opticalConnection.update({
            where: { id },
            data: { status: dto.status, notes: dto.notes },
            include: CONNECTION_INCLUDE,
        });
    }
    async remove(id) {
        const connection = await this.findOne(id);
        const statusAfter = async (terminationId) => (await this.prisma.opticalConnection.count({
            where: { id: { not: id }, deletedAt: null, OR: [{ sourceTerminationId: terminationId }, { targetTerminationId: terminationId }] },
        })) > 0 ? 'USED' : 'FREE';
        await Promise.all([
            this.setPortStatus(connection.sourceTermination.entityType, connection.sourceTermination.entityId, await statusAfter(connection.sourceTerminationId)),
            this.setPortStatus(connection.targetTermination.entityType, connection.targetTermination.entityId, await statusAfter(connection.targetTerminationId)),
        ]);
        await this.syncBoxOccupancyForTypes([
            { type: connection.sourceTermination.entityType, entityId: connection.sourceTermination.entityId },
            { type: connection.targetTermination.entityType, entityId: connection.targetTermination.entityId },
        ]);
        return this.prisma.opticalConnection.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'REMOVED' },
        });
    }
};
OpticalConnectionsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        OpticalTopologyValidatorService,
        ConnectionsTableService])
], OpticalConnectionsService);
export { OpticalConnectionsService };
//# sourceMappingURL=optical-connections.service.js.map