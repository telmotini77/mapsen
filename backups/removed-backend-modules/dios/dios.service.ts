import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDioDto } from './dto/create-dio.dto.js';
import { UpdateDioDto } from './dto/update-dio.dto.js';

@Injectable()
export class DiosService {
  constructor(private readonly prisma: PrismaService) {}
  private capacity(capacity?: number, used?: number) { if (capacity !== undefined && used !== undefined && used > capacity) throw new BadRequestException('Puertos usados superan la capacidad del DIO'); }
  async create(dto: CreateDioDto) {
    this.capacity(dto.capacity, dto.usedPorts);
    const pop = dto.popId ? await this.prisma.pop.findUnique({ where: { id: dto.popId } }) : null;
    const rack = dto.rackId ? await this.prisma.rack.findUnique({ where: { id: dto.rackId } }) : null;
    if (dto.popId && (!pop || pop.deletedAt)) throw new NotFoundException('POP no encontrado');
    if (dto.rackId && (!rack || rack.deletedAt)) throw new NotFoundException('Rack no encontrado');
    const projectId = dto.projectId ?? pop?.projectId ?? rack?.projectId;
    if (!projectId) throw new BadRequestException('Un DIO requiere proyecto, POP o rack');
    if ((pop && pop.projectId !== projectId) || (rack && rack.projectId !== projectId)) throw new BadRequestException('El DIO debe pertenecer a la misma red');
    const code = dto.code ?? `DIO-${Date.now()}`;
    if (await this.prisma.dio.findUnique({ where: { code_projectId: { code, projectId } } })) throw new ConflictException('Código DIO duplicado');
    return this.prisma.dio.create({ data: { ...dto, projectId, code } });
  }
  findAll(projectId?: string) { return this.prisma.dio.findMany({ where: { deletedAt: null, projectId }, include: { pop: { select: { code: true } }, rack: { select: { code: true } } }, orderBy: { code: 'asc' } }); }
  async findOne(id: string) { const dio = await this.prisma.dio.findUnique({ where: { id } }); if (!dio || dio.deletedAt) throw new NotFoundException('DIO no encontrado'); return dio; }
  async update(id: string, dto: UpdateDioDto) { const current = await this.findOne(id); this.capacity(dto.capacity ?? current.capacity, dto.usedPorts ?? current.usedPorts); return this.prisma.dio.update({ where: { id }, data: dto }); }
  async remove(id: string) { await this.findOne(id); return this.prisma.dio.update({ where: { id }, data: { deletedAt: new Date(), status: 'REMOVED' } }); }
}
