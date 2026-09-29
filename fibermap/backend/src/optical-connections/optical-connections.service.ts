import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OpticalTopologyValidatorService } from '../optical-topology-validator/optical-topology-validator.service.js';
import { CreateOpticalConnectionDto } from './dto/create-optical-connection.dto.js';
import { UpdateOpticalConnectionDto } from './dto/update-optical-connection.dto.js';
import { CreateFiberLinkDto } from './dto/create-fiber-link.dto.js';
import { ConnectionsTableService, MAX_FIBERS_PER_PORT, boxPortLabel, splitterPortNumber } from '../cables/connections-table.service.js';

// Extremo de un hilo dentro de un dispositivo (enlaces hilo → puerto de la tabla de conexiones).
export const FIBER_ENTITY = 'FIBER';

const CONNECTION_INCLUDE = {
  sourceTermination: true,
  targetTermination: true,
  sourceFiber: { select: { id: true, number: true, color: true, label: true } },
  targetFiber: { select: { id: true, number: true, color: true, label: true } },
} as const;

@Injectable()
export class OpticalConnectionsService {
  constructor(
    private prisma: PrismaService,
    private topologyValidator: OpticalTopologyValidatorService,
    private connectionsTable: ConnectionsTableService,
  ) {}

  private async resolveTermination(type: string, entityId: string, boxId: string) {
    const existing = await this.prisma.opticalTermination.findFirst({
      where: { entityType: type, entityId },
    });
    if (existing) return existing;

    return this.prisma.opticalTermination.create({
      data: { type, entityType: type, entityId, boxId },
    });
  }

  private setPortStatus(type: string, entityId: string, status: string) {
    // El extremo "hilo" de un enlace hilo→puerto no es un puerto: no tiene estado.
    if (type === FIBER_ENTITY) return Promise.resolve(null);
    if (type === 'ODF_PORT') {
      return this.prisma.odfPort.update({ where: { id: entityId }, data: { status } });
    }
    if (type === 'BOX_PORT') {
      return this.prisma.boxPort.update({ where: { id: entityId }, data: { status } });
    }
    return this.prisma.splitterPort.update({ where: { id: entityId }, data: { status } });
  }

  // Enlace hilo → puerto hecho desde la tabla de conexiones: se guarda como una fusión cuyo origen es
  // el extremo del hilo en ese dispositivo (terminación FIBER) y cuyo destino es el puerto. Un puerto
  // recibe un solo hilo y un hilo entra a un solo puerto de cada dispositivo.
  async createFiberLink(dto: CreateFiberLinkDto) {
    const isOdf = dto.deviceType === 'ODF';
    const device = isOdf
      ? await this.prisma.odf.findUnique({ where: { id: dto.deviceId }, select: { id: true, deletedAt: true } })
      : await this.prisma.box.findUnique({ where: { id: dto.deviceId }, select: { id: true, type: true, deletedAt: true } });
    if (!device || device.deletedAt) throw new NotFoundException('Dispositivo no encontrado');

    const fiber = await this.prisma.fiber.findUnique({ where: { id: dto.fiberId }, include: { cable: { include: { cable: { select: { code: true } } } } } });
    if (!fiber || fiber.deletedAt) throw new BadRequestException('El hilo no existe');
    const covered = await this.prisma.cableConnection.findFirst({
      where: { cableId: fiber.cable.cableId, elementType: dto.deviceType, elementId: dto.deviceId, fiberFrom: { lte: fiber.number }, fiberTo: { gte: fiber.number } },
    });
    if (!covered) throw new BadRequestException(`El hilo ${fiber.number} de ${fiber.cable.cable.code} no llega a este dispositivo.`);

    // Puerto de destino, validando que sea de este dispositivo.
    const separator = dto.terminalKey.indexOf(':');
    const portType = dto.terminalKey.slice(0, separator);
    const portRef = dto.terminalKey.slice(separator + 1);
    let portId: string;
    let portLabel: string;
    // Tipo con el que se guarda la terminación (un puerto de empalme nuevo se guarda como BOX_PORT).
    let storedType = portType;
    if (isOdf) {
      const number = Number(portRef);
      if (portType !== 'ODF_PORT' || !Number.isInteger(number) || number < 1) throw new BadRequestException('Puerto del ODF no válido');
      const port = await this.prisma.odfPort.upsert({
        where: { odfId_number: { odfId: dto.deviceId, number } },
        create: { odfId: dto.deviceId, number },
        update: {},
      });
      portId = port.id;
      portLabel = `Puerto ${number}`;
    } else if (portType === 'BOX_PORT') {
      const port = await this.prisma.boxPort.findUnique({ where: { id: portRef } });
      if (!port || port.deletedAt || port.boxId !== dto.deviceId) throw new BadRequestException('El puerto no es de esta caja');
      portId = port.id;
      portLabel = boxPortLabel(port);
    } else if (portType === 'BOX_PORT_NUMBER') {
      // Posición de empalme de una manga de paso/empalme: se crea la primera vez que se usa.
      const number = Number(portRef);
      const box = await this.prisma.box.findUnique({ where: { id: dto.deviceId }, select: { type: true, mangaType: true, capacity: true } });
      if (box?.type !== 'MANGA' || box.mangaType === 'DISTRIBUCION' || !Number.isInteger(number) || number < 1 || number > (box.capacity ?? 0)) {
        throw new BadRequestException('Puerto de empalme no válido');
      }
      const port = await this.prisma.boxPort.upsert({
        where: { boxId_number: { boxId: dto.deviceId, number } },
        create: { boxId: dto.deviceId, number, type: 'EMPALME' },
        update: { deletedAt: null },
      });
      portId = port.id;
      portLabel = boxPortLabel(port);
      storedType = 'BOX_PORT';
    } else if (portType === 'SPLITTER_INPUT' || portType === 'SPLITTER_OUTPUT') {
      const port = await this.prisma.splitterPort.findUnique({ where: { id: portRef }, include: { splitter: true } });
      if (!port || port.splitter.deletedAt || port.splitter.boxId !== dto.deviceId) throw new BadRequestException('El puerto de splitter no es de esta caja');
      if (port.portType === 'INPUT') throw new BadRequestException('El splitter solo usa sus puertos 1 a 8 (o 1 a 16); el puerto común ya no se conecta.');
      portId = port.id;
      portLabel = `${port.splitter.code} · Puerto ${splitterPortNumber(port)}`;
    } else {
      throw new BadRequestException('Tipo de puerto no válido');
    }

    const deviceScope = isOdf ? { odfId: dto.deviceId } : { boxId: dto.deviceId };
    const active = await this.prisma.opticalConnection.findMany({
      where: { deletedAt: null, sourceTermination: { entityType: FIBER_ENTITY, ...deviceScope } },
      include: { sourceTermination: true, targetTermination: true, targetFiber: { select: { number: true } } },
    });
    if (active.some((c) => c.sourceTermination.entityId === fiber.id)) {
      throw new ConflictException(`El hilo ${fiber.number} ya está en otro puerto de este dispositivo. Quítalo primero.`);
    }
    // Cada puerto une dos hilos (uno por lado). Se cuenta lo que muestra la hoja, que en el ODF incluye
    // el hilo que llega por defecto a ese puerto.
    const sheet = await this.connectionsTable.build(dto.deviceType as 'ODF' | 'MANGA' | 'NAP', dto.deviceId, isOdf ? (await this.prisma.odf.findUnique({ where: { id: dto.deviceId }, select: { capacity: true } }))?.capacity : null);
    const sheetKey = isOdf ? `ODF_PORT:${Number(portRef)}` : `${storedType}:${portId}`;
    const onPort = sheet.terminals.find((t) => t.key === sheetKey)?.fibers.filter((f) => f.fiberId !== fiber.id) ?? [];
    if (onPort.length >= MAX_FIBERS_PER_PORT) {
      throw new ConflictException(`${portLabel} ya une dos hilos (${onPort.map((f) => `${f.cableCode} hilo ${f.number}`).join(' y ')}). Quita uno primero.`);
    }

    const termination = (entityType: string, entityId: string) =>
      this.prisma.opticalTermination.findFirst({ where: { entityType, entityId, ...deviceScope } }).then(
        (existing) => existing ?? this.prisma.opticalTermination.create({ data: { type: entityType === FIBER_ENTITY ? 'FIBER_END' : entityType, entityType, entityId, ...deviceScope } }),
      );
    const [source, target] = await Promise.all([termination(FIBER_ENTITY, fiber.id), termination(storedType, portId)]);

    const connection = await this.prisma.opticalConnection.create({
      data: { sourceTerminationId: source.id, targetTerminationId: target.id, sourceFiberId: fiber.id, targetFiberId: fiber.id, connectionType: 'SPLICE' },
      include: CONNECTION_INCLUDE,
    });
    await this.setPortStatus(storedType, portId, 'USED');
    await this.syncBoxOccupancyForTypes([{ type: storedType, entityId: portId }]);
    return connection;
  }

  private async syncBoxOccupancyForTypes(references: { type: string; entityId: string }[]) {
    const boxPortIds = references.filter((reference) => reference.type === 'BOX_PORT').map((reference) => reference.entityId);
    if (boxPortIds.length === 0) return;

    const ports = await this.prisma.boxPort.findMany({
      where: { id: { in: boxPortIds } },
      select: { boxId: true },
    });
    const boxIds = [...new Set(ports.map((port) => port.boxId))];
    await Promise.all(boxIds.map(async (boxId) => {
      const usedPorts = await this.prisma.boxPort.count({
        where: { boxId, deletedAt: null, status: { in: ['USED', 'RESERVED'] } },
      });
      return this.prisma.box.update({ where: { id: boxId }, data: { usedPorts } });
    }));
  }

  // El hilo debe llegar a esta caja: o algún cable conectado a ella lo cubre en su rango (lo normal,
  // se conecta solo al trazar), o fue asignado a uno de sus puertos por el método anterior.
  private async assertFiberAtBox(fiberId: string, box: { id: string; type: string }, side: string) {
    const fiber = await this.prisma.fiber.findUnique({ where: { id: fiberId } });
    if (!fiber || fiber.deletedAt) throw new BadRequestException(`El hilo de ${side} no existe`);
    const covered = await this.prisma.cableConnection.findFirst({
      where: { cableId: fiber.cableId, elementType: box.type, elementId: box.id, fiberFrom: { lte: fiber.number }, fiberTo: { gte: fiber.number } },
    });
    if (covered) return fiber;
    const terminations = await this.prisma.opticalTermination.findMany({ where: { boxId: box.id }, select: { id: true } });
    const assigned = await this.prisma.fiberSegment.findFirst({
      where: {
        fiberId,
        status: 'ACTIVE',
        OR: [{ startTerminationId: { in: terminations.map((t) => t.id) } }, { endTerminationId: { in: terminations.map((t) => t.id) } }],
      },
    });
    if (!assigned) throw new BadRequestException(`El hilo ${fiber.number} de ${side} no llega a esta caja: ningún cable conectado a ella lo cubre.`);
    return fiber;
  }

  async create(dto: CreateOpticalConnectionDto) {
    const box = await this.prisma.box.findUnique({ where: { id: dto.boxId }, select: { id: true, type: true, deletedAt: true } });
    if (!box || box.deletedAt) throw new NotFoundException('Caja no encontrada');
    if (dto.sourceFiberId) await this.assertFiberAtBox(dto.sourceFiberId, box, 'origen');
    if (dto.targetFiberId) await this.assertFiberAtBox(dto.targetFiberId, box, 'destino');

    const source = await this.resolveTermination(dto.sourceType, dto.sourceId, dto.boxId);
    const target = await this.resolveTermination(dto.targetType, dto.targetId, dto.boxId);

    await this.topologyValidator.validateNoCycles(source.id, target.id);
    await this.topologyValidator.validateTerminationAvailability(source.id);
    await this.topologyValidator.validateTerminationAvailability(target.id);

    const connection = await this.prisma.opticalConnection.create({
      data: {
        sourceTerminationId: source.id,
        targetTerminationId: target.id,
        sourceFiberId: dto.sourceFiberId ?? null,
        targetFiberId: dto.targetFiberId ?? null,
        connectionType: dto.connectionType ?? 'SPLICE',
        lossDb: dto.lossDb,
        notes: dto.notes,
      },
      include: CONNECTION_INCLUDE,
    });

    await Promise.all([
      this.setPortStatus(dto.sourceType, dto.sourceId, 'USED'),
      this.setPortStatus(dto.targetType, dto.targetId, 'USED'),
    ]);
    await this.syncBoxOccupancyForTypes([
      { type: dto.sourceType, entityId: dto.sourceId },
      { type: dto.targetType, entityId: dto.targetId },
    ]);

    return connection;
  }

  // Busca la terminación de un puerto de caja o de splitter, o la crea si es la primera vez que se
  // usa (igual que al registrar una fusión). Permite trazar desde un puerto sin fusión registrada:
  // la continuidad interna de un splitter se descubre sola (ver OpticalContinuityEngineService).
  async findOrCreateTerminationId(entityType: string, entityId: string, boxId: string) {
    if (!['BOX_PORT', 'SPLITTER_INPUT', 'SPLITTER_OUTPUT'].includes(entityType)) {
      throw new BadRequestException('Tipo de terminal no permitido');
    }
    const box = await this.prisma.box.findUnique({ where: { id: boxId } });
    if (!box || box.deletedAt) throw new NotFoundException('Caja no encontrada');
    if (entityType === 'BOX_PORT') {
      const port = await this.prisma.boxPort.findUnique({ where: { id: entityId } });
      if (!port || port.deletedAt || port.boxId !== boxId) throw new BadRequestException('El puerto de caja seleccionado no es válido');
    } else {
      const port = await this.prisma.splitterPort.findUnique({ where: { id: entityId }, include: { splitter: true } });
      if (!port || port.splitter.deletedAt || port.splitter.boxId !== boxId) throw new BadRequestException('El puerto de splitter seleccionado no es válido');
    }
    const termination = await this.resolveTermination(entityType, entityId, boxId);
    return { terminationId: termination.id };
  }

  async findAllForBox(boxId: string) {
    const terminations = await this.prisma.opticalTermination.findMany({
      where: { boxId },
      select: { id: true },
    });
    const terminationIds = terminations.map((t) => t.id);
    if (terminationIds.length === 0) return [];

    return this.prisma.opticalConnection.findMany({
      where: {
        deletedAt: null,
        OR: [
          { sourceTerminationId: { in: terminationIds } },
          { targetTerminationId: { in: terminationIds } },
        ],
      },
      include: CONNECTION_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const connection = await this.prisma.opticalConnection.findUnique({
      where: { id },
      include: CONNECTION_INCLUDE,
    });
    if (!connection || connection.deletedAt) throw new NotFoundException('Conexión no encontrada');
    return connection;
  }

  async update(id: string, dto: UpdateOpticalConnectionDto) {
    await this.findOne(id);
    return this.prisma.opticalConnection.update({
      where: { id },
      data: { status: dto.status, notes: dto.notes },
      include: CONNECTION_INCLUDE,
    });
  }

  async remove(id: string) {
    const connection = await this.findOne(id);

    // Un puerto une hasta dos hilos: solo queda libre si no le queda otra conexión activa.
    const statusAfter = async (terminationId: string) =>
      (await this.prisma.opticalConnection.count({
        where: { id: { not: id }, deletedAt: null, OR: [{ sourceTerminationId: terminationId }, { targetTerminationId: terminationId }] },
      })) > 0 ? 'USED' : 'FREE';
    await Promise.all([
      this.setPortStatus(connection.sourceTermination.entityType, connection.sourceTermination.entityId, await statusAfter(connection.sourceTerminationId)),
      this.setPortStatus(connection.targetTermination.entityType, connection.targetTermination.entityId, await statusAfter(connection.targetTerminationId)),
    ]);
    await this.syncBoxOccupancyForTypes([
      { type: connection.sourceTermination.entityType, entityId: connection.sourceTermination.entityId },
      { type: connection.targetTermination.entityType, entityId: connection.targetTermination.entityId },
    ]);

    return this.prisma.opticalConnection.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'REMOVED' },
    });
  }
}
