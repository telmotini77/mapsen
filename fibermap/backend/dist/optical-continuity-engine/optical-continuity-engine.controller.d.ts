import { OpticalContinuityEngineService } from './optical-continuity-engine.service.js';
export declare class OpticalContinuityEngineController {
    private readonly engine;
    constructor(engine: OpticalContinuityEngineService);
    traceFromTermination(id: string): Promise<{
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
