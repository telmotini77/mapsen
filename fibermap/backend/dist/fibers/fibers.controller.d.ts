import { FibersService } from './fibers.service.js';
import { UpdateFiberConfigurationDto } from './dto/update-fiber-configuration.dto.js';
import { SetFiberTerminationsDto } from './dto/set-fiber-terminations.dto.js';
export declare class FibersController {
    private readonly fibersService;
    constructor(fibersService: FibersService);
    assignmentOptions(cableId: string): Promise<{
        source: {
            terminationId: string | null;
            type: string;
            entityId: string;
            boxId: string;
            portIdentifier: string;
            label: string;
            status: string;
        }[];
        target: {
            terminationId: string | null;
            type: string;
            entityId: string;
            boxId: string;
            portIdentifier: string;
            label: string;
            status: string;
        }[];
    }>;
    assignmentsForBox(boxId: string): Promise<{
        entityId: string | undefined;
        fiberId: string;
        fiberNumber: number;
        cableId: string;
        cableCode: string;
        color: string;
        label: string | null;
    }[]>;
    configure(id: string, dto: UpdateFiberConfigurationDto): Promise<{
        number: number;
        description: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        cableId: string;
        color: string;
        version: number;
        label: string | null;
        tubeId: string;
        numberInTube: number;
        attenuationDbPerKm: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    setTerminations(id: string, dto: SetFiberTerminationsDto): Promise<{
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fiberId: string;
        startTerminationId: string;
        endTerminationId: string;
        lengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        calculatedLossDb: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
