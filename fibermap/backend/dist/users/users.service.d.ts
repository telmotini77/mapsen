import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
export type UserPreferences = {
    showLegend: boolean;
    showImportedPoles: boolean;
    confirmDestructiveActions: boolean;
};
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto): Promise<{
        name: string;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        lastLogin: Date | null;
        roles: {
            name: string;
            id: string;
            permissions: {
                name: string;
                id: string;
            }[];
        }[];
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        name: string;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        lastLogin: Date | null;
        roles: {
            name: string;
            id: string;
            permissions: {
                name: string;
                id: string;
            }[];
        }[];
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        lastLogin: Date | null;
        roles: {
            name: string;
            id: string;
            permissions: {
                name: string;
                id: string;
            }[];
        }[];
    }>;
    findByEmailWithCredentials(email: string): import(".prisma/client").Prisma.Prisma__UserClient<({
        roles: ({
            permissions: {
                name: string;
                description: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
        } & {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
    } & {
        name: string;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        preferences: import("@prisma/client/runtime/library").JsonValue | null;
        lastLogin: Date | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: UpdateUserDto): Promise<{
        name: string;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        lastLogin: Date | null;
        roles: {
            name: string;
            id: string;
            permissions: {
                name: string;
                id: string;
            }[];
        }[];
    }>;
    remove(id: string): Promise<{
        name: string;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        lastLogin: Date | null;
        roles: {
            name: string;
            id: string;
            permissions: {
                name: string;
                id: string;
            }[];
        }[];
    }>;
    touchLastLogin(id: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        name: string;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        preferences: import("@prisma/client/runtime/library").JsonValue | null;
        lastLogin: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getPreferences(id: string): Promise<UserPreferences>;
    updatePreferences(id: string, changes: Partial<UserPreferences>): Promise<UserPreferences>;
}
