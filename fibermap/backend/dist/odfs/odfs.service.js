var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConnectionsTableService } from '../cables/connections-table.service.js';
let OdfsService = class OdfsService {
    prisma;
    connectionsTable;
    constructor(prisma, connectionsTable) {
        this.prisma = prisma;
        this.connectionsTable = connectionsTable;
    }
    async projectId() {
        let project = await this.prisma.project.findFirst({ where: { deletedAt: null } });
        if (!project)
            project = await this.prisma.project.create({ data: { code: 'DEF-001', name: 'Proyecto por Defecto' } });
        return project.id;
    }
    geometry(id, longitude, latitude) {
        return this.prisma.$executeRaw `UPDATE odfs SET geometry = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326) WHERE id = ${id}`;
    }
    async create(dto) {
        const projectId = await this.projectId();
        const code = dto.code?.trim() || dto.name.trim();
        if (await this.prisma.odf.findUnique({ where: { code_projectId: { code, projectId } } })) {
            throw new ConflictException(`Ya existe un ODF con el código "${code}"`);
        }
        const capacity = dto.capacity ?? 24;
        const odf = await this.prisma.odf.create({
            data: {
                code,
                name: dto.name.trim(),
                projectId,
                latitude: dto.latitude,
                longitude: dto.longitude,
                capacity,
                description: dto.description,
                ports: { create: Array.from({ length: capacity }, (_, i) => ({ number: i + 1 })) },
            },
            include: { ports: { orderBy: { number: 'asc' } } },
        });
        await this.geometry(odf.id, dto.longitude, dto.latitude);
        return odf;
    }
    findAll() {
        return this.prisma.odf.findMany({ where: { deletedAt: null }, orderBy: { code: 'asc' } });
    }
    async findOne(id) {
        const odf = await this.prisma.odf.findUnique({
            where: { id },
            include: { ports: { orderBy: { number: 'asc' } } },
        });
        if (!odf || odf.deletedAt)
            throw new NotFoundException('ODF no encontrado');
        return odf;
    }
    async table(id) {
        const odf = await this.findOne(id);
        const { portsInUse, cables, terminals } = await this.connectionsTable.build('ODF', id, odf.capacity);
        return {
            device: { id: odf.id, kind: 'ODF', code: odf.code, name: odf.name, capacity: odf.capacity, status: odf.status },
            portsInUse,
            cables,
            terminals,
        };
    }
    async update(id, dto) {
        const current = await this.findOne(id);
        const updated = await this.prisma.odf.update({
            where: { id },
            data: { name: dto.name?.trim(), latitude: dto.latitude, longitude: dto.longitude, status: dto.status, description: dto.description },
        });
        if (dto.latitude !== undefined || dto.longitude !== undefined) {
            await this.geometry(id, dto.longitude ?? Number(current.longitude), dto.latitude ?? Number(current.latitude));
        }
        return updated;
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.odf.update({ where: { id }, data: { deletedAt: new Date(), status: 'REMOVED' } });
    }
};
OdfsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService, ConnectionsTableService])
], OdfsService);
export { OdfsService };
//# sourceMappingURL=odfs.service.js.map