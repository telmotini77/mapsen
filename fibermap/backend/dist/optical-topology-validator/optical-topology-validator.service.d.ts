import { PrismaService } from '../prisma/prisma.service.js';
export declare class OpticalTopologyValidatorService {
    private prisma;
    constructor(prisma: PrismaService);
    validateNoCycles(sourceTerminationId: string, targetTerminationId: string): Promise<boolean>;
    validateTerminationAvailability(terminationId: string): Promise<boolean>;
}
