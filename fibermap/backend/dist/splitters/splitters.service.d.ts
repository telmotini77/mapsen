import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateSplitterDto } from './dto/update-splitter.dto.js';
import { CreateSplitterDto } from './dto/create-splitter.dto.js';
import { OpticalConnectionsService } from '../optical-connections/optical-connections.service.js';
export declare class SplittersService {
    private prisma;
    private opticalConnections;
    constructor(prisma: PrismaService, opticalConnections: OpticalConnectionsService);
    calculateSplitterOccupation(id: string): Promise<{
        splitterId: string;
        totalPorts: number;
        usedPorts: number;
        occupationPercentage: number;
    }>;
    private assertRatioAllowed;
    private syncNapCapacity;
    create(dto: CreateSplitterDto): Promise<{
        ports: {
            number: number;
            status: string;
            id: string;
            createdAt: Date;
            lossDb: import("@prisma/client/runtime/library").Decimal | null;
            label: string | null;
            splitterId: string;
            portType: string;
        }[];
    } & {
        code: string;
        name: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        manufacturerId: string | null;
        model: string | null;
        version: number;
        boxId: string | null;
        ratio: string;
        splitterType: string;
        inputCount: number;
        outputCount: number;
        insertionLossDb: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    findAll(query?: {
        boxId?: string;
    }): import(".prisma/client").Prisma.PrismaPromise<({
        box: {
            code: string;
            id: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            type: string;
            mangaType: string | null;
        } | null;
        ports: {
            number: number;
            status: string;
            id: string;
            createdAt: Date;
            lossDb: import("@prisma/client/runtime/library").Decimal | null;
            label: string | null;
            splitterId: string;
            portType: string;
        }[];
    } & {
        code: string;
        name: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        manufacturerId: string | null;
        model: string | null;
        version: number;
        boxId: string | null;
        ratio: string;
        splitterType: string;
        inputCount: number;
        outputCount: number;
        insertionLossDb: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    findOne(id: string): Promise<{
        ports: {
            number: number;
            status: string;
            id: string;
            createdAt: Date;
            lossDb: import("@prisma/client/runtime/library").Decimal | null;
            label: string | null;
            splitterId: string;
            portType: string;
        }[];
    } & {
        code: string;
        name: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        manufacturerId: string | null;
        model: string | null;
        version: number;
        boxId: string | null;
        ratio: string;
        splitterType: string;
        inputCount: number;
        outputCount: number;
        insertionLossDb: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    update(id: string, dto: UpdateSplitterDto): Promise<{
        box: {
            code: string;
            id: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
        } | null;
        ports: {
            number: number;
            status: string;
            id: string;
            createdAt: Date;
            lossDb: import("@prisma/client/runtime/library").Decimal | null;
            label: string | null;
            splitterId: string;
            portType: string;
        }[];
    } & {
        code: string;
        name: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        manufacturerId: string | null;
        model: string | null;
        version: number;
        boxId: string | null;
        ratio: string;
        splitterType: string;
        inputCount: number;
        outputCount: number;
        insertionLossDb: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    remove(id: string, force?: boolean): Promise<{
        code: string;
        name: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        manufacturerId: string | null;
        model: string | null;
        version: number;
        boxId: string | null;
        ratio: string;
        splitterType: string;
        inputCount: number;
        outputCount: number;
        insertionLossDb: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
