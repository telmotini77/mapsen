import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
export declare class ProjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProjectDto): Promise<{
        code: string;
        name: string;
        description: string | null;
        status: string;
        centerLatitude: import("@prisma/client/runtime/library").Decimal;
        centerLongitude: import("@prisma/client/runtime/library").Decimal;
        defaultZoom: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        code: string;
        name: string;
        description: string | null;
        status: string;
        centerLatitude: import("@prisma/client/runtime/library").Decimal;
        centerLongitude: import("@prisma/client/runtime/library").Decimal;
        defaultZoom: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        code: string;
        name: string;
        description: string | null;
        status: string;
        centerLatitude: import("@prisma/client/runtime/library").Decimal;
        centerLongitude: import("@prisma/client/runtime/library").Decimal;
        defaultZoom: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    update(id: string, dto: UpdateProjectDto): Promise<{
        code: string;
        name: string;
        description: string | null;
        status: string;
        centerLatitude: import("@prisma/client/runtime/library").Decimal;
        centerLongitude: import("@prisma/client/runtime/library").Decimal;
        defaultZoom: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    remove(id: string): Promise<{
        code: string;
        name: string;
        description: string | null;
        status: string;
        centerLatitude: import("@prisma/client/runtime/library").Decimal;
        centerLongitude: import("@prisma/client/runtime/library").Decimal;
        defaultZoom: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
}
