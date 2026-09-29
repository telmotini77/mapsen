var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { nearestWithin } from '../cables/cable-geometry.js';
const DEFAULT_LIST_LIMIT = 20000;
const MAX_LIST_LIMIT = 50000;
let PolesService = class PolesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async defaultProjectId() {
        let project = await this.prisma.project.findFirst({ where: { deletedAt: null } });
        if (!project)
            project = await this.prisma.project.create({ data: { code: 'DEF-001', name: 'Proyecto por Defecto' } });
        return project.id;
    }
    async findAll(bounds, limit = DEFAULT_LIST_LIMIT) {
        return this.prisma.pole.findMany({
            where: {
                deletedAt: null,
                ...(bounds && {
                    latitude: { gte: bounds.south, lte: bounds.north },
                    longitude: { gte: bounds.west, lte: bounds.east },
                }),
            },
            select: { id: true, code: true, name: true, latitude: true, longitude: true, material: true },
            orderBy: { code: 'asc' },
            take: Math.min(Math.max(limit, 1), MAX_LIST_LIMIT),
        });
    }
    async nearestTo(points, radiusMeters) {
        return Promise.all(points.map(async (point) => {
            const dLat = radiusMeters / 110_540;
            const dLng = radiusMeters / (111_320 * Math.max(Math.cos((point.lat * Math.PI) / 180), 0.01));
            const nearby = await this.prisma.pole.findMany({
                where: {
                    deletedAt: null,
                    latitude: { gte: point.lat - dLat, lte: point.lat + dLat },
                    longitude: { gte: point.lng - dLng, lte: point.lng + dLng },
                },
                select: { id: true, code: true, latitude: true, longitude: true },
                take: 50,
            });
            return nearestWithin(point, nearby.map((pole) => ({ id: pole.id, code: pole.code, lat: Number(pole.latitude), lng: Number(pole.longitude) })), radiusMeters);
        }));
    }
    async count() {
        return { total: await this.prisma.pole.count({ where: { deletedAt: null } }) };
    }
    async importFromKmz(dto) {
        if (dto.poles.length === 0)
            return { imported: 0, skipped: 0 };
        const projectId = await this.defaultProjectId();
        const lats = dto.poles.map((p) => p.latitude);
        const lngs = dto.poles.map((p) => p.longitude);
        const existingAtLocation = await this.prisma.pole.findMany({
            where: {
                projectId,
                deletedAt: null,
                latitude: { gte: Math.min(...lats) - 1e-6, lte: Math.max(...lats) + 1e-6 },
                longitude: { gte: Math.min(...lngs) - 1e-6, lte: Math.max(...lngs) + 1e-6 },
            },
            select: { latitude: true, longitude: true },
        });
        const locationKey = (lat, lng) => `${lat.toFixed(7)},${lng.toFixed(7)}`;
        const takenLocations = new Set(existingAtLocation.map((p) => locationKey(Number(p.latitude), Number(p.longitude))));
        const fresh = dto.poles.filter((pole) => {
            const key = locationKey(pole.latitude, pole.longitude);
            if (takenLocations.has(key))
                return false;
            takenLocations.add(key);
            return true;
        });
        if (fresh.length === 0)
            return { imported: 0, skipped: dto.poles.length };
        const baseCodes = fresh.map((pole, index) => this.safeCode(pole.code || pole.name || `POSTE-${index + 1}`));
        const clashing = await this.prisma.pole.findMany({ where: { projectId, code: { in: [...new Set(baseCodes)] } }, select: { code: true } });
        const usedCodes = new Set(clashing.map((pole) => pole.code.toUpperCase()));
        const rows = fresh.map((pole, index) => {
            const code = this.uniqueCode(baseCodes[index], usedCodes);
            return {
                id: randomUUID(),
                projectId,
                code,
                name: pole.name?.trim() || code,
                latitude: pole.latitude,
                longitude: pole.longitude,
                material: pole.material?.trim() || 'OTHER',
                owner: pole.owner?.trim() || null,
                notes: (pole.notes ?? pole.description)?.trim() || null,
            };
        });
        const { count } = await this.prisma.pole.createMany({ data: rows, skipDuplicates: true });
        const ids = rows.map((row) => row.id);
        await this.prisma.$executeRaw `
      UPDATE poles
      SET geometry = ST_SetSRID(ST_MakePoint(longitude::float8, latitude::float8), 4326)
      WHERE id = ANY(${ids}::text[])
    `;
        return { imported: count, skipped: dto.poles.length - count };
    }
    safeCode(value) {
        const normalized = value.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 70);
        return normalized || 'POSTE';
    }
    uniqueCode(baseCode, usedCodes) {
        let candidate = baseCode;
        let suffix = 2;
        while (usedCodes.has(candidate.toUpperCase()))
            candidate = `${baseCode}-${suffix++}`;
        usedCodes.add(candidate.toUpperCase());
        return candidate;
    }
};
PolesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], PolesService);
export { PolesService };
//# sourceMappingURL=poles.service.js.map