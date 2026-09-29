import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOltDto, UpdateOltDto } from './dto/create-olt.dto.js';

const withPort = { odfPort: { select: { id: true, number: true, odf: { select: { id: true, code: true, name: true } } } } };

@Injectable()
export class OltsService {
  constructor(private readonly prisma: PrismaService) {}

  private async projectId() {
    let project = await this.prisma.project.findFirst({ where: { deletedAt: null } });
    if (!project) project = await this.prisma.project.create({ data: { code: 'DEF-001', name: 'Proyecto por Defecto' } });
    return project.id;
  }

  private geometry(id: string, longitude: number, latitude: number) {
    return this.prisma.$executeRaw`UPDATE olts SET geometry = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326) WHERE id = ${id}`;
  }

  // Un puerto de ODF solo puede alimentar a una OLT; se valida que exista, que el ODF no
  // esté dado de baja y que el puerto esté libre (o sea el que la propia OLT ya ocupa).
  private async assertPortAvailable(odfPortId: string, currentOltId?: string) {
    const port = await this.prisma.odfPort.findUnique({ where: { id: odfPortId }, include: { odf: true, olt: true } });
    if (!port || port.odf.deletedAt) throw new NotFoundException('El puerto de ODF seleccionado no existe');
    if (port.olt && port.olt.id !== currentOltId && !port.olt.deletedAt) {
      throw new ConflictException(`El puerto ${port.number} de ${port.odf.code} ya está conectado a la OLT ${port.olt.code}`);
    }
    return port;
  }

  private async syncOdfUsage(odfId: string) {
    const used = await this.prisma.odfPort.count({ where: { odfId, olt: { deletedAt: null } } });
    await this.prisma.odf.update({ where: { id: odfId }, data: { usedPorts: used } });
    const ports = await this.prisma.odfPort.findMany({ where: { odfId }, include: { olt: true } });
    await Promise.all(
      ports.map((p) => {
        const status = p.olt && !p.olt.deletedAt ? 'USED' : 'FREE';
        return status === p.status ? null : this.prisma.odfPort.update({ where: { id: p.id }, data: { status } });
      }),
    );
  }

  async create(dto: CreateOltDto) {
    const port = await this.assertPortAvailable(dto.odfPortId);
    const projectId = await this.projectId();
    const code = dto.code?.trim() || dto.name.trim();
    if (await this.prisma.olt.findUnique({ where: { code_projectId: { code, projectId } } })) {
      throw new ConflictException(`Ya existe una OLT con el código "${code}"`);
    }
    const olt = await this.prisma.olt.create({
      data: {
        code,
        name: dto.name.trim(),
        projectId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        odfPortId: dto.odfPortId,
        manufacturer: dto.manufacturer,
        model: dto.model,
        serialNumber: dto.serialNumber,
        managementIp: dto.managementIp,
        description: dto.description,
      },
      include: withPort,
    });
    await this.geometry(olt.id, dto.longitude, dto.latitude);
    await this.syncOdfUsage(port.odfId);
    return olt;
  }

  findAll() {
    return this.prisma.olt.findMany({ where: { deletedAt: null }, include: withPort, orderBy: { code: 'asc' } });
  }

  async findOne(id: string) {
    const olt = await this.prisma.olt.findUnique({ where: { id }, include: withPort });
    if (!olt || olt.deletedAt) throw new NotFoundException('OLT no encontrada');
    return olt;
  }

  async update(id: string, dto: UpdateOltDto) {
    const current = await this.findOne(id);
    let previousOdfId: string | undefined;
    let nextOdfId: string | undefined;
    if (dto.odfPortId && dto.odfPortId !== current.odfPortId) {
      const port = await this.assertPortAvailable(dto.odfPortId, id);
      nextOdfId = port.odfId;
      previousOdfId = current.odfPort?.odf.id;
    }
    const updated = await this.prisma.olt.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        odfPortId: dto.odfPortId,
        status: dto.status,
        manufacturer: dto.manufacturer,
        model: dto.model,
        description: dto.description,
      },
      include: withPort,
    });
    if (dto.latitude !== undefined || dto.longitude !== undefined) {
      await this.geometry(id, dto.longitude ?? Number(current.longitude), dto.latitude ?? Number(current.latitude));
    }
    if (nextOdfId) await this.syncOdfUsage(nextOdfId);
    if (previousOdfId && previousOdfId !== nextOdfId) await this.syncOdfUsage(previousOdfId);
    return updated;
  }

  async remove(id: string) {
    const current = await this.findOne(id);
    // Al retirar la OLT se libera su puerto de ODF para poder conectar otra.
    const removed = await this.prisma.olt.update({ where: { id }, data: { deletedAt: new Date(), status: 'REMOVED', odfPortId: null } });
    if (current.odfPort) await this.syncOdfUsage(current.odfPort.odf.id);
    return removed;
  }
}
