import { PrismaService } from '../prisma/prisma.service.js';
export declare class OpticalContinuityEngineService {
    private prisma;
    constructor(prisma: PrismaService);
    traceFiber(startTerminationId: string): Promise<{
        message: string;
        startTerminationId: string;
        totalLossDb: number;
        traceSequence: {
            id: string;
            sourceTerminationId: string;
            targetTerminationId: string;
            connectionType: string;
            lossDb: number | null;
            step: number;
            sourceLabel: string;
            targetLabel: string;
            cumulativeLossDb: number;
        }[];
    }>;
    traceFromPon(ponId: string): Promise<{
        message: string;
        startTerminationId: string;
        totalLossDb: number;
        traceSequence: {
            id: string;
            sourceTerminationId: string;
            targetTerminationId: string;
            connectionType: string;
            lossDb: number | null;
            step: number;
            sourceLabel: string;
            targetLabel: string;
            cumulativeLossDb: number;
        }[];
    } | {
        message: string;
        ponId: string;
        traceSequence: never[];
    }>;
}
