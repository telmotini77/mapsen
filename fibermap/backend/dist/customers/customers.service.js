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
const DEFAULT_MAX_DISTANCE_METERS = 250;
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolveProjectId(projectId) {
        if (projectId)
            return projectId;
        let project = await this.prisma.project.findFirst();
        if (!project) {
            project = await this.prisma.project.create({
                data: { code: 'DEF-001', name: 'Proyecto por Defecto' },
            });
        }
        return project.id;
    }
    async findNearestBox(projectId, lat, lng) {
        const rows = await this.prisma.$queryRaw `
      SELECT id, code, name, "portCapacity", capacity, "usedPorts", latitude, longitude,
        ST_Distance(geometry::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) AS "distanceMeters"
      FROM boxes
      WHERE "projectId" = ${projectId} AND "deletedAt" IS NULL AND type = 'NAP' AND geometry IS NOT NULL
      ORDER BY geometry <-> ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      LIMIT 1;
    `;
        return rows[0] ?? null;
    }
    async checkViability(dto) {
        const projectId = await this.resolveProjectId(dto.projectId);
        const maxDistance = dto.maxDistanceMeters ?? DEFAULT_MAX_DISTANCE_METERS;
        const nearest = await this.findNearestBox(projectId, dto.lat, dto.lng);
        if (!nearest) {
            return {
                viable: false,
                reason: 'No hay cajas de red registradas en el proyecto.',
                nearestBox: null,
                distanceMeters: null,
                portsAvailable: null,
            };
        }
        const distanceMeters = Math.round(Number(nearest.distanceMeters) * 100) / 100;
        const withinRange = distanceMeters <= maxDistance;
        const totalPorts = nearest.portCapacity > 0 ? nearest.portCapacity : (nearest.capacity ?? 0);
        const portsAvailable = Math.max(0, totalPorts - nearest.usedPorts);
        const hasCapacity = portsAvailable > 0;
        const viable = withinRange && hasCapacity;
        return {
            viable,
            distanceMeters,
            maxDistanceMeters: maxDistance,
            withinRange,
            portsAvailable,
            reason: !withinRange
                ? `La caja más cercana está a ${Math.round(distanceMeters)}m, fuera del rango de cobertura (${maxDistance}m).`
                : !hasCapacity
                    ? 'La caja más cercana no tiene puertos disponibles.'
                    : null,
            nearestBox: {
                id: nearest.id,
                code: nearest.code,
                name: nearest.name,
                latitude: Number(nearest.latitude),
                longitude: Number(nearest.longitude),
            },
        };
    }
    async create(dto) {
        const projectId = await this.resolveProjectId(dto.projectId);
        const viability = await this.checkViability({ lat: dto.latitude, lng: dto.longitude, projectId });
        const customer = await this.prisma.customer.create({
            data: {
                projectId,
                code: dto.code,
                name: dto.name,
                documentId: dto.documentId,
                phone: dto.phone,
                email: dto.email,
                address: dto.address,
                latitude: dto.latitude,
                longitude: dto.longitude,
                notes: dto.notes,
                status: viability.viable ? 'VIABLE' : 'NOT_VIABLE',
                nearestBoxId: viability.nearestBox?.id,
                distanceToBoxMeters: viability.distanceMeters ?? undefined,
            },
        });
        await this.prisma.$executeRaw `
      UPDATE customers
      SET geometry = ST_SetSRID(ST_MakePoint(${dto.longitude}, ${dto.latitude}), 4326)
      WHERE id = ${customer.id}
    `;
        return { ...customer, viability };
    }
    findAll(query = {}) {
        const { projectId, status, search } = query;
        const where = { deletedAt: null };
        if (projectId)
            where.projectId = projectId;
        if (status)
            where.status = status;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.customer.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: { nearestBox: true },
        });
        if (!customer || customer.deletedAt)
            throw new NotFoundException('Cliente no encontrado');
        return customer;
    }
    async update(id, dto) {
        const existing = await this.findOne(id);
        const nextLat = dto.latitude ?? Number(existing.latitude);
        const nextLng = dto.longitude ?? Number(existing.longitude);
        const locationChanged = dto.latitude !== undefined || dto.longitude !== undefined;
        let viability;
        if (locationChanged) {
            viability = await this.checkViability({
                lat: nextLat,
                lng: nextLng,
                projectId: existing.projectId,
            });
        }
        const customer = await this.prisma.customer.update({
            where: { id },
            data: {
                code: dto.code,
                name: dto.name,
                documentId: dto.documentId,
                phone: dto.phone,
                email: dto.email,
                address: dto.address,
                latitude: dto.latitude,
                longitude: dto.longitude,
                notes: dto.notes,
                status: dto.status ?? (viability ? (viability.viable ? 'VIABLE' : 'NOT_VIABLE') : undefined),
                nearestBoxId: viability ? viability.nearestBox?.id : undefined,
                distanceToBoxMeters: viability ? (viability.distanceMeters ?? undefined) : undefined,
            },
        });
        if (locationChanged) {
            await this.prisma.$executeRaw `
        UPDATE customers
        SET geometry = ST_SetSRID(ST_MakePoint(${nextLng}, ${nextLat}), 4326)
        WHERE id = ${id}
      `;
        }
        return customer;
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.customer.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'INACTIVE' },
        });
    }
};
CustomersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], CustomersService);
export { CustomersService };
//# sourceMappingURL=customers.service.js.map