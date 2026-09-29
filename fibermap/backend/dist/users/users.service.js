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
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
const PUBLIC_USER_SELECT = {
    id: true,
    name: true,
    email: true,
    status: true,
    lastLogin: true,
    createdAt: true,
    updatedAt: true,
    roles: {
        select: {
            id: true,
            name: true,
            permissions: { select: { id: true, name: true } },
        },
    },
};
const DEFAULT_PREFERENCES = {
    showLegend: false,
    showImportedPoles: true,
    confirmDestructiveActions: true,
};
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) {
            throw new ConflictException('Ya existe un usuario con ese email');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        return this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash,
                roles: dto.roleNames?.length
                    ? { connect: dto.roleNames.map((name) => ({ name })) }
                    : undefined,
            },
            select: PUBLIC_USER_SELECT,
        });
    }
    findAll() {
        return this.prisma.user.findMany({ select: PUBLIC_USER_SELECT });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({ where: { id }, select: PUBLIC_USER_SELECT });
        if (!user)
            throw new NotFoundException('Usuario no encontrado');
        return user;
    }
    findByEmailWithCredentials(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { roles: { include: { permissions: true } } },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.user.update({
            where: { id },
            data: {
                name: dto.name,
                email: dto.email,
                roles: dto.roleNames
                    ? { set: dto.roleNames.map((name) => ({ name })) }
                    : undefined,
            },
            select: PUBLIC_USER_SELECT,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.user.update({
            where: { id },
            data: { status: 'INACTIVE' },
            select: PUBLIC_USER_SELECT,
        });
    }
    touchLastLogin(id) {
        return this.prisma.user.update({ where: { id }, data: { lastLogin: new Date() } });
    }
    async getPreferences(id) {
        const user = await this.prisma.user.findUnique({ where: { id }, select: { preferences: true } });
        if (!user)
            throw new NotFoundException('Usuario no encontrado');
        const saved = user.preferences && typeof user.preferences === 'object' && !Array.isArray(user.preferences)
            ? user.preferences
            : {};
        return { ...DEFAULT_PREFERENCES, ...saved };
    }
    async updatePreferences(id, changes) {
        const preferences = { ...(await this.getPreferences(id)), ...changes };
        await this.prisma.user.update({ where: { id }, data: { preferences } });
        return preferences;
    }
};
UsersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map