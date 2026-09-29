import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateChamberDto } from './dto/create-chamber.dto.js';
import { UpdateChamberDto } from './dto/update-chamber.dto.js';

@Injectable()
export class ChambersService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveProjectId(projectId?: string) {
    if (projectId) {
      const project = await this.prisma.project.findUnique({ where: { id: projectId } });
      if (!project || project.deletedAt) throw new NotFoundException('Proyecto no encontrado');
      return projectId;
    }
    let project = await this.prisma.project.findFirst({ where: { deletedAt: null }, orderBy: { createdAt: 'asc' } });
    if (!project) project = await this.prisma.project.create({ data: { code: 'DEF-001', name: 'Proyecto por Defecto' } });
    return project.id;
  }

  async create(dto: CreateChamberDto) {
    const projectId = await this.resolveProjectId(dto.projectId);
    const code = dto.code ?? `CH-${Date.now()}`;
    const exists = await this.prisma.chamber.findUnique({ where: { code_projectId: { code, projectId } } });
    if (exists) throw new ConflictException('Ya existe una cámara con ese código en el proyecto');
    const chamber = await this.prisma.chamber.create({ data: { ...dto, projectId, code } });
    await this.setGeometry(chamber.id, dto.longitude, dto.latitude);
    return chamber;
  }

  findAll(projectId?: string) {
    return this.prisma.chamber.findMany({ where: { deletedAt: null, projectId }, orderBy: { code: 'asc' } });
  }

  async findOne(id: string) {
    const chamber = await this.prisma.chamber.findUnique({ where: { id } });
    if (!chamber || chamber.deletedAt) throw new NotFoundException('Cámara no encontrada');
    return chamber;
  }

  async update(id: string, dto: UpdateChamberDto) {
    const current = await this.findOne(id);
    const updated = await this.prisma.chamber.update({ where: { id }, data: dto });
    if (dto.latitude !== undefined || dto.longitude !== undefined) {
      await this.setGeometry(id, dto.longitude ?? Number(current.longitude), dto.latitude ?? Number(current.latitude));
    }
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.chamber.update({ where: { id }, data: { deletedAt: new Date(), status: 'REMOVED' } });
  }

  private setGeometry(id: string, longitude: number, latitude: number) {
    return this.prisma.$executeRaw`
      UPDATE chambers SET geometry = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326) WHERE id = ${id}
    `;
  }
}
