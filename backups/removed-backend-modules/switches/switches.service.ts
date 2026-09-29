import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSwitchDto } from './dto/create-switch.dto.js';
import { UpdateSwitchDto } from './dto/update-switch.dto.js';

@Injectable()
export class SwitchesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateSwitchDto) {
    const pop = dto.popId ? await this.prisma.pop.findUnique({ where: { id: dto.popId } }) : null;
    const rack = dto.rackId ? await this.prisma.rack.findUnique({ where: { id: dto.rackId } }) : null;
    if (dto.popId && (!pop || pop.deletedAt)) throw new NotFoundException('POP no encontrado');
    if (dto.rackId && (!rack || rack.deletedAt)) throw new NotFoundException('Rack no encontrado');
    const projectId = dto.projectId ?? pop?.projectId ?? rack?.projectId;
    if (!projectId) throw new BadRequestException('Un switch requiere proyecto, POP o rack');
    if ((pop && pop.projectId !== projectId) || (rack && rack.projectId !== projectId)) throw new BadRequestException('El switch debe pertenecer a la misma red');
    const code = dto.code ?? `SW-${Date.now()}`;
    if (await this.prisma.networkSwitch.findUnique({ where: { code_projectId: { code, projectId } } })) throw new ConflictException('Código de switch duplicado');
    return this.prisma.networkSwitch.create({ data: { ...dto, projectId, code } });
  }
  findAll(projectId?: string) { return this.prisma.networkSwitch.findMany({ where: { deletedAt: null, projectId }, include: { pop: { select: { code: true } }, rack: { select: { code: true } } }, orderBy: { code: 'asc' } }); }
  async findOne(id: string) { const item = await this.prisma.networkSwitch.findUnique({ where: { id } }); if (!item || item.deletedAt) throw new NotFoundException('Switch no encontrado'); return item; }
  async update(id: string, dto: UpdateSwitchDto) { await this.findOne(id); return this.prisma.networkSwitch.update({ where: { id }, data: dto }); }
  async remove(id: string) { await this.findOne(id); return this.prisma.networkSwitch.update({ where: { id }, data: { deletedAt: new Date(), status: 'REMOVED' } }); }
}
