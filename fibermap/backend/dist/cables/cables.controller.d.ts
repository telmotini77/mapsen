import { CablesService } from './cables.service.js';
import { CreateCableDto } from './dto/create-cable.dto.js';
import { UpdateCableDto } from './dto/update-cable.dto.js';
import { UpdateCableConnectionDto } from './dto/update-cable-connection.dto.js';
export declare class CablesController {
    private readonly cablesService;
    constructor(cablesService: CablesService);
    create(createCableDto: CreateCableDto): Promise<{
        deviceConnections: unknown[];
        code: string;
        name: string | null;
        description: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        type: string;
        manufacturerId: string | null;
        model: string | null;
        fiberCount: number;
        tubeCount: number;
        fibersPerTube: number;
        installationType: string | null;
        startNodeType: string | null;
        startNodeId: string | null;
        endNodeType: string | null;
        endNodeId: string | null;
        calculatedLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        technicalLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        color: string;
        version: number;
        path: {
            lat: number;
            lng: number;
        }[];
    }>;
    findAll(projectId?: string): Promise<{
        deviceConnections: unknown[];
        code: string;
        name: string | null;
        description: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        type: string;
        manufacturerId: string | null;
        model: string | null;
        fiberCount: number;
        tubeCount: number;
        fibersPerTube: number;
        installationType: string | null;
        startNodeType: string | null;
        startNodeId: string | null;
        endNodeType: string | null;
        endNodeId: string | null;
        calculatedLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        technicalLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        color: string;
        version: number;
        path: {
            lat: number;
            lng: number;
        }[];
    }[]>;
    inspection(id: string): Promise<{
        cable: {
            id: string;
            code: string;
            name: string | null;
            type: string;
            fiberCount: number;
            tubeCount: number;
            fibersPerTube: number;
            status: string;
            color: string;
            calculatedLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        };
        deviceConnections: unknown[];
        inventoryReady: boolean;
        connectedSplitters: {
            linkedFibers: number[];
            linkedPorts: {
                type: string;
                number: number;
                status: string;
            }[];
            id: string;
            code: string;
            name: string | null;
            ratio: string;
            status: string;
            box: {
                code: string;
                name: string | null;
            } | null;
        }[];
        fibers: {
            id: string;
            number: number;
            numberInTube: number;
            color: string;
            label: string | null;
            status: string;
            attenuationDbPerKm: import("@prisma/client/runtime/library").Decimal | null;
            description: string | null;
            tube: {
                number: number;
                color: string;
                label: string | null;
            };
            connections: {
                id: string;
                status: string;
                lengthMeters: import("@prisma/client/runtime/library").Decimal | null;
                lossDb: import("@prisma/client/runtime/library").Decimal | null;
                from: {
                    id: string;
                    label: string;
                    type?: undefined;
                } | {
                    id: string;
                    label: string;
                    type: string;
                };
                to: {
                    id: string;
                    label: string;
                    type?: undefined;
                } | {
                    id: string;
                    label: string;
                    type: string;
                };
            }[];
        }[];
    }>;
    initializeFibers(id: string): Promise<{
        cable: {
            id: string;
            code: string;
            name: string | null;
            type: string;
            fiberCount: number;
            tubeCount: number;
            fibersPerTube: number;
            status: string;
            color: string;
            calculatedLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        };
        deviceConnections: unknown[];
        inventoryReady: boolean;
        connectedSplitters: {
            linkedFibers: number[];
            linkedPorts: {
                type: string;
                number: number;
                status: string;
            }[];
            id: string;
            code: string;
            name: string | null;
            ratio: string;
            status: string;
            box: {
                code: string;
                name: string | null;
            } | null;
        }[];
        fibers: {
            id: string;
            number: number;
            numberInTube: number;
            color: string;
            label: string | null;
            status: string;
            attenuationDbPerKm: import("@prisma/client/runtime/library").Decimal | null;
            description: string | null;
            tube: {
                number: number;
                color: string;
                label: string | null;
            };
            connections: {
                id: string;
                status: string;
                lengthMeters: import("@prisma/client/runtime/library").Decimal | null;
                lossDb: import("@prisma/client/runtime/library").Decimal | null;
                from: {
                    id: string;
                    label: string;
                    type?: undefined;
                } | {
                    id: string;
                    label: string;
                    type: string;
                };
                to: {
                    id: string;
                    label: string;
                    type?: undefined;
                } | {
                    id: string;
                    label: string;
                    type: string;
                };
            }[];
        }[];
    }>;
    findOne(id: string): Promise<{
        deviceConnections: unknown[];
        code: string;
        name: string | null;
        description: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        type: string;
        manufacturerId: string | null;
        model: string | null;
        fiberCount: number;
        tubeCount: number;
        fibersPerTube: number;
        installationType: string | null;
        startNodeType: string | null;
        startNodeId: string | null;
        endNodeType: string | null;
        endNodeId: string | null;
        calculatedLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        technicalLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        color: string;
        version: number;
        path: {
            lat: number;
            lng: number;
        }[];
    }>;
    reconnect(id: string): Promise<{
        deviceConnections: unknown[];
        code: string;
        name: string | null;
        description: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        type: string;
        manufacturerId: string | null;
        model: string | null;
        fiberCount: number;
        tubeCount: number;
        fibersPerTube: number;
        installationType: string | null;
        startNodeType: string | null;
        startNodeId: string | null;
        endNodeType: string | null;
        endNodeId: string | null;
        calculatedLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        technicalLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        color: string;
        version: number;
        path: {
            lat: number;
            lng: number;
        }[];
    }>;
    updateConnection(id: string, connectionId: string, dto: UpdateCableConnectionDto): Promise<{
        deviceConnections: unknown[];
        code: string;
        name: string | null;
        description: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        type: string;
        manufacturerId: string | null;
        model: string | null;
        fiberCount: number;
        tubeCount: number;
        fibersPerTube: number;
        installationType: string | null;
        startNodeType: string | null;
        startNodeId: string | null;
        endNodeType: string | null;
        endNodeId: string | null;
        calculatedLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        technicalLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        color: string;
        version: number;
        path: {
            lat: number;
            lng: number;
        }[];
    }>;
    update(id: string, updateCableDto: UpdateCableDto): Promise<{
        deviceConnections: unknown[];
        code: string;
        name: string | null;
        description: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        type: string;
        manufacturerId: string | null;
        model: string | null;
        fiberCount: number;
        tubeCount: number;
        fibersPerTube: number;
        installationType: string | null;
        startNodeType: string | null;
        startNodeId: string | null;
        endNodeType: string | null;
        endNodeId: string | null;
        calculatedLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        technicalLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        color: string;
        version: number;
        path: {
            lat: number;
            lng: number;
        }[];
    }>;
    remove(id: string): Promise<{
        code: string;
        name: string | null;
        description: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        type: string;
        manufacturerId: string | null;
        model: string | null;
        fiberCount: number;
        tubeCount: number;
        fibersPerTube: number;
        installationType: string | null;
        startNodeType: string | null;
        startNodeId: string | null;
        endNodeType: string | null;
        endNodeId: string | null;
        calculatedLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        technicalLengthMeters: import("@prisma/client/runtime/library").Decimal | null;
        color: string;
        version: number;
    }>;
}
