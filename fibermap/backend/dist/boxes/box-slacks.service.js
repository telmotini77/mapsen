var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
let BoxSlacksService = class BoxSlacksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async box(id) {
        const box = await this.prisma.box.findFirst({ where: { id, deletedAt: null, type: { in: ['NAP', 'MANGA'] } } });
        if (!box || box.deletedAt || !['NAP', 'MANGA'].includes(box.type))
            throw new NotFoundException('Caja NAP o manga no encontrada');
        return box;
    }
    meters(value) {
        if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)
            throw new BadRequestException('Los metros deben ser un número positivo');
        return value;
    }
    async eligible(boxes) {
        if (!boxes.length)
            return [];
        const connections = await this.prisma.cableConnection.findMany({
            where: { OR: boxes.map(box => ({ elementId: box.id, elementType: box.type, cable: { deletedAt: null, projectId: box.projectId } })) },
            include: { cable: true },
        });
        return connections.filter(connection => boxes.some(box => box.id === connection.elementId && box.type === connection.elementType && box.projectId === connection.cable.projectId && !connection.cable.deletedAt));
    }
    serialize(record, code) {
        return { id: record.id, boxId: record.locationId, cableId: record.cableId, cableCode: code, meters: Number(record.meters) };
    }
    async map() {
        const boxes = await this.prisma.box.findMany({ where: { deletedAt: null, type: { in: ['NAP', 'MANGA'] } } });
        const eligible = await this.eligible(boxes.filter(box => !box.deletedAt && ['NAP', 'MANGA'].includes(box.type)));
        const records = await this.prisma.cableSlack.findMany({ where: { locationType: 'BOX', locationId: { in: boxes.map(box => box.id) } } });
        return records.flatMap(record => {
            const connection = eligible.find(item => item.elementId === record.locationId && item.cableId === record.cableId);
            return record.locationType === 'BOX' && connection && Number(record.meters) > 0 && Number.isFinite(Number(record.meters)) ? [this.serialize(record, connection.cable.code)] : [];
        });
    }
    async list(boxId) {
        const box = await this.box(boxId);
        const connections = await this.eligible([box]);
        const records = await this.prisma.cableSlack.findMany({ where: { locationType: 'BOX', locationId: boxId } });
        const cables = connections.map(connection => ({ id: connection.cableId, code: connection.cable.code }));
        const reservations = records.flatMap(record => {
            const cable = cables.find(cable => cable.id === record.cableId);
            return record.locationType === 'BOX' && record.locationId === boxId && cable && Number(record.meters) > 0 && Number.isFinite(Number(record.meters)) ? [this.serialize(record, cable.code)] : [];
        });
        return { reservations, cables };
    }
    async connected(boxId, cableId) {
        const box = await this.box(boxId);
        if (!(await this.eligible([box])).some(connection => connection.cableId === cableId))
            throw new BadRequestException('El cable debe estar conectado a esta caja y pertenecer al mismo proyecto');
    }
    async create(boxId, dto) {
        const meters = this.meters(dto.meters);
        await this.connected(boxId, dto.cableId);
        return this.prisma.cableSlack.create({ data: { cableId: dto.cableId, locationType: 'BOX', locationId: boxId, meters } });
    }
    async owned(boxId, id) {
        await this.box(boxId);
        const record = await this.prisma.cableSlack.findFirst({ where: { id, locationType: 'BOX', locationId: boxId } });
        if (!record)
            throw new NotFoundException('Reserva no encontrada');
        return record;
    }
    async update(boxId, id, dto) {
        const meters = this.meters(dto.meters);
        const record = await this.owned(boxId, id);
        await this.connected(boxId, record.cableId);
        return this.prisma.cableSlack.update({ where: { id }, data: { meters } });
    }
    async remove(boxId, id) {
        await this.owned(boxId, id);
        return this.prisma.cableSlack.delete({ where: { id } });
    }
};
BoxSlacksService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], BoxSlacksService);
export { BoxSlacksService };
//# sourceMappingURL=box-slacks.service.js.map