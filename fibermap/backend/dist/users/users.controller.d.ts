import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        name: string;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roles: {
            name: string;
            id: string;
            permissions: {
                name: string;
                id: string;
            }[];
        }[];
        email: string;
        lastLogin: Date | null;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        name: string;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roles: {
            name: string;
            id: string;
            permissions: {
                name: string;
                id: string;
            }[];
        }[];
        email: string;
        lastLogin: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roles: {
            name: string;
            id: string;
            permissions: {
                name: string;
                id: string;
            }[];
        }[];
        email: string;
        lastLogin: Date | null;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        name: string;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roles: {
            name: string;
            id: string;
            permissions: {
                name: string;
                id: string;
            }[];
        }[];
        email: string;
        lastLogin: Date | null;
    }>;
    remove(id: string): Promise<{
        name: string;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roles: {
            name: string;
            id: string;
            permissions: {
                name: string;
                id: string;
            }[];
        }[];
        email: string;
        lastLogin: Date | null;
    }>;
}
