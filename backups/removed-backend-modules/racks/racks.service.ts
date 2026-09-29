import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRackDto } from './dto/create-rack.dto.js';
import { UpdateRackDto } from './dto/update-rack.dto.js';

@Injectable()
export class RacksService {
  constructor(private readonly prisma: PrismaService) {}
  private capacity(rackUnits?: number, usedUnits?: number) {
    if (rackUnits !== undefined && usedUnits !== undefined && usedUnits > rackUnits) throw new BadRequestException('Las unidades usadas superan la capacidad del rack');
  }
  async create(dto: CreateRackDto) {
    this.capacity(dto.rackUnits, dto.usedUnits);
    const pop = await this.prisma.pop.findUnique({ where: { id: dto.popId } });
    if (!pop || pop.deletedAt) throw new NotFoundException('POP no encontrado');
    if (dto.projectId && dto.projectId !== pop.projectId) throw new BadRequestException('El rack debe pertenecer al proyecto de su POP');
    const code = dto.code ?? `RACK-${Date.now()}`;
    if (await this.prisma.rack.findUnique({ where: { code_projectId: { code, projectId: pop.projectId } } })) throw new ConflictException('Código de rack duplicado');
    return this.prisma.rack.create({ data: { ...dto, projectId: pop.projectId, code } });
  }
  findAll(projectId?: string) { return this.prisma.rack.findMany({ where: { deletedAt: null, projectId }, include: { pop: { select: { code: true, name: true } } }, orderBy: { code: 'asc' } }); }
  async findOne(id: string) { const rack = await this.prisma.rack.findUnique({ where: { id }, include: { pop: true } }); if (!rack || rack.deletedAt) throw new NotFoundException('Rack no encontrado'); return rack; }
  async update(id: string, dto: UpdateRackDto) {
    const current = await this.findOne(id);
    this.capacity(dto.rackUnits ?? current.rackUnits, dto.usedUnits ?? current.usedUnits);
    if (dto.popId && dto.popId !== current.popId) throw new BadRequestException('No se puede mover un rack a otro POP mediante esta operación');
    const { projectId: _projectId, popId: _popId, ...data } = dto;
    return this.prisma.rack.update({ where: { id }, data });
  }
  async remove(id: string) { await this.findOne(id); return this.prisma.rack.update({ where: { id }, data: { deletedAt: new Date(), status: 'REMOVED' } }); }
}
