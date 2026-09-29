import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePoleDto } from './dto/create-pole.dto.js';
import { UpdatePoleDto } from './dto/update-pole.dto.js';

@Injectable()
export class PolesService {
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

  async create(dto: CreatePoleDto) {
    const projectId = await this.resolveProjectId(dto.projectId);
    const code = dto.code ?? `POL-${Date.now()}`;
    const exists = await this.prisma.pole.findUnique({ where: { code_projectId: { code, projectId } } });
    if (exists) throw new ConflictException('Ya existe un poste con ese código en el proyecto');
    const pole = await this.prisma.pole.create({ data: { ...dto, projectId, code } });
    await this.setGeometry(pole.id, dto.longitude, dto.latitude);
    return pole;
  }

  findAll(projectId?: string) {
    return this.prisma.pole.findMany({ where: { deletedAt: null, projectId }, orderBy: { code: 'asc' } });
  }

  async findOne(id: string) {
    const pole = await this.prisma.pole.findUnique({ where: { id } });
    if (!pole || pole.deletedAt) throw new NotFoundException('Poste no encontrado');
    return pole;
  }

  async update(id: string, dto: UpdatePoleDto) {
    const current = await this.findOne(id);
    const updated = await this.prisma.pole.update({ where: { id }, data: dto });
    if (dto.latitude !== undefined || dto.longitude !== undefined) {
      await this.setGeometry(id, dto.longitude ?? Number(current.longitude), dto.latitude ?? Number(current.latitude));
    }
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.pole.update({ where: { id }, data: { deletedAt: new Date(), status: 'REMOVED' } });
  }

  private setGeometry(id: string, longitude: number, latitude: number) {
    return this.prisma.$executeRaw`
      UPDATE poles SET geometry = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326) WHERE id = ${id}
    `;
  }
}
