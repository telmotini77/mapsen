import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDuctDto } from './dto/create-duct.dto.js';
import { UpdateDuctDto } from './dto/update-duct.dto.js';

@Injectable()
export class DuctsService {
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

  private ensureCapacity(capacity?: number, occupiedCapacity?: number) {
    if (capacity !== undefined && occupiedCapacity !== undefined && occupiedCapacity > capacity) {
      throw new BadRequestException('La ocupación no puede superar la capacidad del ducto');
    }
  }

  private async setGeometry(id: string, points: { lat: number; lng: number }[]) {
    const wkt = `LINESTRING(${points.map((p) => `${p.lng} ${p.lat}`).join(',')})`;
    await this.prisma.$executeRaw`
      UPDATE ducts
      SET geometry = ST_SetSRID(ST_GeomFromText(${wkt}), 4326),
          "calculatedLengthMeters" = ST_Length(ST_SetSRID(ST_GeomFromText(${wkt}), 4326)::geography)
      WHERE id = ${id}
    `;
  }

  private async attachPath<T extends { id: string }>(ducts: T[]) {
    return Promise.all(ducts.map(async (duct) => {
      const rows = await this.prisma.$queryRaw<{ geojson: string | null }[]>`
        SELECT ST_AsGeoJSON(geometry) AS geojson FROM ducts WHERE id = ${duct.id}
      `;
      const coordinates: [number, number][] = rows[0]?.geojson ? JSON.parse(rows[0].geojson).coordinates : [];
      return { ...duct, path: coordinates.map(([lng, lat]) => ({ lat, lng })) };
    }));
  }

  async create(dto: CreateDuctDto) {
    this.ensureCapacity(dto.capacity, dto.occupiedCapacity);
    const projectId = await this.resolveProjectId(dto.projectId);
    const code = dto.code ?? `DUCT-${Date.now()}`;
    const exists = await this.prisma.duct.findUnique({ where: { code_projectId: { code, projectId } } });
    if (exists) throw new ConflictException('Ya existe un ducto con ese código en el proyecto');

    const { points, projectId: _projectId, ...data } = dto;
    const duct = await this.prisma.duct.create({ data: { ...data, projectId, code } });
    await this.setGeometry(duct.id, points);
    return this.findOne(duct.id);
  }

  async findAll(projectId?: string) {
    const ducts = await this.prisma.duct.findMany({ where: { deletedAt: null, projectId }, orderBy: { code: 'asc' } });
    return this.attachPath(ducts);
  }

  async findOne(id: string) {
    const duct = await this.prisma.duct.findUnique({ where: { id } });
    if (!duct || duct.deletedAt) throw new NotFoundException('Ducto no encontrado');
    const [withPath] = await this.attachPath([duct]);
    return withPath;
  }

  async update(id: string, dto: UpdateDuctDto) {
    const current = await this.findOne(id);
    this.ensureCapacity(dto.capacity ?? current.capacity, dto.occupiedCapacity ?? current.occupiedCapacity);
    const { points, projectId: _projectId, ...data } = dto;
    await this.prisma.duct.update({ where: { id }, data });
    if (points?.length) await this.setGeometry(id, points);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.duct.update({ where: { id }, data: { deletedAt: new Date(), status: 'REMOVED' } });
  }
}
