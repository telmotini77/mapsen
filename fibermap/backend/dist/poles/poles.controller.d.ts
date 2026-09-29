import { ImportPolesDto } from './dto/import-poles.dto.js';
import { PolesService } from './poles.service.js';
export declare class PolesController {
    private readonly polesService;
    constructor(polesService: PolesService);
    findAll(west?: string, south?: string, east?: string, north?: string, limit?: string): Promise<{
        code: string;
        name: string | null;
        id: string;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        material: string;
    }[]>;
    count(): Promise<{
        total: number;
    }>;
    importFromKmz(dto: ImportPolesDto): Promise<{
        imported: number;
        skipped: number;
    }>;
}
