import { PrismaService } from '../prisma/prisma.service.js';
export declare class CableCapacityService {
    private prisma;
    constructor(prisma: PrismaService);
    calculateCableOccupation(cableId: string): Promise<{
        cableId: string;
        totalCapacity: number;
        usedCapacity: number;
        occupationPercentage: number;
    }>;
}
