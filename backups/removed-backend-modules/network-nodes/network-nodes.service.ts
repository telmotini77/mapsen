import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NetworkNodesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    // Generate code if missing
    if (!data.code) {
      data.code = `NODE-${Date.now()}`;
    }

    // Default project handling (for testing without a full project UI)
    if (!data.projectId) {
      let project = await this.prisma.project.findFirst();
      if (!project) {
        project = await this.prisma.project.create({
          data: {
            code: 'DEF-PROJECT',
            name: 'Default Project',
          }
        });
      }
      data.projectId = project.id;
    }

    const {
      latitude,
      longitude,
      code,
      name,
      nodeType,
      status,
      description,
      projectId,
      regionId,
      zoneId,
      parentNodeId,
      externalReference,
      metadata,
      locationSource,
      accuracyMeters,
    } = data;

    const node = await this.prisma.networkNode.create({
      data: {
        code,
        name,
        nodeType,
        status,
        description,
        projectId,
        regionId,
        zoneId,
        parentNodeId,
        externalReference,
        metadata,
        locationSource,
        accuracyMeters,
        latitude,
        longitude,
      }
    });

    if (latitude && longitude) {
      await this.prisma.$executeRaw`
        UPDATE network_nodes
        SET geometry = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
        WHERE id = ${node.id}
      `;
    }

    return node;
  }

  async findAll(query: any = {}) {
    const { projectId, nodeType, status, search, bbox } = query;
    const where: any = { deletedAt: null };

    if (projectId) where.projectId = projectId;
    if (nodeType) where.nodeType = nodeType;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { externalReference: { contains: search, mode: 'insensitive' } }
      ];
    }

    let nodes = await this.prisma.networkNode.findMany({ where });

    // In a real app we could use PostGIS for bbox like: ST_MakeEnvelope
    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
      nodes = nodes.filter((n: any) => 
        n.longitude >= minLng && n.longitude <= maxLng &&
        n.latitude >= minLat && n.latitude <= maxLat
      );
    }

    return nodes;
  }

  async findOne(id: string) {
    const node = await this.prisma.networkNode.findUnique({
      where: { id }
    });
    if (!node || node.deletedAt) throw new NotFoundException('Node not found');
    return node;
  }

  async update(id: string, data: any) {
    const { latitude, longitude, ...restData } = data;
    
    // Update simple fields and logic
    const updated = await this.prisma.networkNode.update({
      where: { id },
      data: { ...restData, latitude, longitude, version: { increment: 1 } }
    });

    if (latitude !== undefined && longitude !== undefined) {
      await this.prisma.$executeRaw`
        UPDATE network_nodes
        SET geometry = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
        WHERE id = ${id}
      `;
    }

    return updated;
  }

  async remove(id: string) {
    return this.prisma.networkNode.update({
      where: { id },
      data: { deletedAt: new Date(), version: { increment: 1 } }
    });
  }
}
