var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
let CableCapacityService = class CableCapacityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateCableOccupation(cableId) {
        const cable = await this.prisma.cable.findUnique({
            where: { id: cableId },
            include: {
                tubes: {
                    include: {
                        fibers: true
                    }
                }
            }
        });
        if (!cable) {
            throw new NotFoundException(`Cable con ID ${cableId} no encontrado`);
        }
        let totalCapacity = cable.fiberCount;
        let usedCapacity = 0;
        for (const tube of cable.tubes) {
            for (const fiber of tube.fibers) {
                if (fiber.status === 'USED' || fiber.status === 'RESERVED') {
                    usedCapacity += 1;
                }
            }
        }
        let occupationPercentage = 0;
        if (totalCapacity > 0) {
            occupationPercentage = (usedCapacity / totalCapacity) * 100;
            occupationPercentage = Math.round(occupationPercentage * 100) / 100;
        }
        return {
            cableId,
            totalCapacity,
            usedCapacity,
            occupationPercentage
        };
    }
};
CableCapacityService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], CableCapacityService);
export { CableCapacityService };
//# sourceMappingURL=cable-capacity.service.js.map