import { PrismaService } from '../prisma/prisma.service.js';
import { ImportPolesDto } from './dto/import-poles.dto.js';
import { type LatLng } from '../cables/cable-geometry.js';
export interface PoleBounds {
    west: number;
    south: number;
    east: number;
    north: number;
}
export declare class PolesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private defaultProjectId;
    findAll(bounds?: PoleBounds, limit?: number): Promise<{
        code: string;
        name: string | null;
        id: string;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        material: string;
    }[]>;
    nearestTo(points: LatLng[], radiusMeters: number): Promise<(({
        id: string;
        code: string;
        lat: number;
        lng: number;
    } & {
        distance: number;
    }) | null)[]>;
    count(): Promise<{
        total: number;
    }>;
    importFromKmz(dto: ImportPolesDto): Promise<{
        imported: number;
        skipped: number;
    }>;
    private safeCode;
    private uniqueCode;
}
