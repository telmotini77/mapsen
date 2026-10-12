var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
let OpticalTopologyValidatorService = class OpticalTopologyValidatorService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateNoCycles(sourceTerminationId, targetTerminationId) {
        if (sourceTerminationId === targetTerminationId) {
            throw new BadRequestException('Optical cycle detected: source and target are the same termination');
        }
        const result = await this.prisma.$queryRaw `
      WITH RECURSIVE trace AS (
        SELECT id, "sourceTerminationId", "targetTerminationId", ARRAY[id::text] as path_ids
        FROM optical_connections
        WHERE "deletedAt" IS NULL AND ("sourceTerminationId" = ${targetTerminationId} OR "targetTerminationId" = ${targetTerminationId})

        UNION ALL

        SELECT c.id, c."sourceTerminationId", c."targetTerminationId", t.path_ids || c.id::text
        FROM optical_connections c
        INNER JOIN trace t ON 
          (c."sourceTerminationId" = t."targetTerminationId" OR 
           c."targetTerminationId" = t."sourceTerminationId" OR
           c."sourceTerminationId" = t."sourceTerminationId" OR
           c."targetTerminationId" = t."targetTerminationId")
        WHERE c."deletedAt" IS NULL AND NOT (c.id::text = ANY(t.path_ids))
      )
      SELECT 1 FROM trace 
      WHERE "sourceTerminationId" = ${sourceTerminationId} OR "targetTerminationId" = ${sourceTerminationId}
      LIMIT 1;
    `;
        if (Array.isArray(result) && result.length > 0) {
            throw new BadRequestException('Optical cycle detected: connecting these points creates a loop in the optical network.');
        }
        return true;
    }
    async validateTerminationAvailability(terminationId) {
        const term = await this.prisma.opticalTermination.findUnique({
            where: { id: terminationId },
            include: {
                sourceConnections: { where: { status: 'ACTIVE', deletedAt: null } },
                targetConnections: { where: { status: 'ACTIVE', deletedAt: null } }
            }
        });
        if (!term) {
            throw new BadRequestException('Termination not found.');
        }
        const activeConnectionsCount = term.sourceConnections.length + term.targetConnections.length;
        if (activeConnectionsCount >= 1) {
            throw new BadRequestException(`Termination ${terminationId} is already connected.`);
        }
        return true;
    }
};
OpticalTopologyValidatorService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], OpticalTopologyValidatorService);
export { OpticalTopologyValidatorService };
//# sourceMappingURL=optical-topology-validator.service.js.map