import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePopDto } from './dto/create-pop.dto.js';
import { UpdatePopDto } from './dto/update-pop.dto.js';

@Injectable()
export class PopsService {
  constructor(private readonly prisma: PrismaService) {}
  private async projectId(input?: string) {
    if (input) {
      const project = await this.prisma.project.findUnique({ where: { id: input } });
      if (!project || project.deletedAt) throw new NotFoundException('Proyecto no encontrado');
      return input;
    }
    let project = await this.prisma.project.findFirst({ where: { deletedAt: null } });
    if (!project) project = await this.prisma.project.create({ data: { code: 'DEF-001', name: 'Proyecto por Defecto' } });
    return project.id;
  }
  async create(dto: CreatePopDto) {
    const projectId = await this.projectId(dto.projectId);
    const code = dto.code ?? `POP-${Date.now()}`;
    if (await this.prisma.pop.findUnique({ where: { code_projectId: { code, projectId } } })) throw new ConflictException('Código POP duplicado');
    const pop = await this.prisma.pop.create({ data: { ...dto, projectId, code } });
    await this.geometry(pop.id, dto.longitude, dto.latitude);
    return pop;
  }
  findAll(projectId?: string) { return this.prisma.pop.findMany({ where: { deletedAt: null, projectId }, orderBy: { code: 'asc' } }); }
  async findOne(id: string) {
    const pop = await this.prisma.pop.findUnique({ where: { id } });
    if (!pop || pop.deletedAt) throw new NotFoundException('POP no encontrado');
    return pop;
  }
  async update(id: string, dto: UpdatePopDto) {
    const current = await this.findOne(id);
    const updated = await this.prisma.pop.update({ where: { id }, data: dto });
    if (dto.latitude !== undefined || dto.longitude !== undefined) await this.geometry(id, dto.longitude ?? Number(current.longitude), dto.latitude ?? Number(current.latitude));
    return updated;
  }
  async remove(id: string) { await this.findOne(id); return this.prisma.pop.update({ where: { id }, data: { deletedAt: new Date(), status: 'REMOVED' } }); }
  private geometry(id: string, longitude: number, latitude: number) {
    return this.prisma.$executeRaw`UPDATE pops SET geometry = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326) WHERE id = ${id}`;
  }
}
