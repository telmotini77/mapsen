import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBoxSlackDto, UpdateBoxSlackDto } from './dto/box-slack.dto.js';
export declare class BoxSlacksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private box;
    private meters;
    private eligible;
    private serialize;
    map(): Promise<{
        id: string;
        boxId: string;
        cableId: string;
        cableCode: string;
        meters: number;
    }[]>;
    list(boxId: string): Promise<{
        reservations: {
            id: string;
            boxId: string;
            cableId: string;
            cableCode: string;
            meters: number;
        }[];
        cables: {
            id: string;
            code: string;
        }[];
    }>;
    private connected;
    create(boxId: string, dto: CreateBoxSlackDto): Promise<{
        id: string;
        meters: import("@prisma/client/runtime/library").Decimal;
        cableId: string;
        notes: string | null;
        locationType: string;
        locationId: string;
    }>;
    private owned;
    update(boxId: string, id: string, dto: UpdateBoxSlackDto): Promise<{
        id: string;
        meters: import("@prisma/client/runtime/library").Decimal;
        cableId: string;
        notes: string | null;
        locationType: string;
        locationId: string;
    }>;
    remove(boxId: string, id: string): Promise<{
        id: string;
        meters: import("@prisma/client/runtime/library").Decimal;
        cableId: string;
        notes: string | null;
        locationType: string;
        locationId: string;
    }>;
}
