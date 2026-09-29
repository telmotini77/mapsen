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
import { PrismaService } from '../prisma/prisma.service.js';
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.project.findUnique({ where: { code: dto.code } });
        if (existing)
            throw new ConflictException('Ya existe un proyecto con ese código');
        return this.prisma.project.create({ data: dto });
    }
    findAll() {
        return this.prisma.project.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project || project.deletedAt)
            throw new NotFoundException('Proyecto no encontrado');
        return project;
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.code) {
            const owner = await this.prisma.project.findUnique({ where: { code: dto.code } });
            if (owner && owner.id !== id)
                throw new ConflictException('Ya existe un proyecto con ese código');
        }
        return this.prisma.project.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.project.update({ where: { id }, data: { deletedAt: new Date(), status: 'ARCHIVED' } });
    }
};
ProjectsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], ProjectsService);
export { ProjectsService };
//# sourceMappingURL=projects.service.js.map