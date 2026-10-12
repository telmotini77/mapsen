import { OpticalConnectionsService } from '../optical-connections/optical-connections.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PolesService } from '../poles/poles.service.js';
import type { Prisma } from '@prisma/client';
import { CreateCableDto } from './dto/create-cable.dto.js';
import { UpdateCableDto } from './dto/update-cable.dto.js';
import { UpdateCableConnectionDto } from './dto/update-cable-connection.dto.js';
export declare class CablesService {
    private prisma;
    private poles;
    private opticalConnections;
    constructor(prisma: PrismaService, poles: PolesService, opticalConnections: OpticalConnectionsService);
    private resolveProjectId;
    private setGeometry;
    private fiberColor;
    private createFiberInventory;
    private applyInventoryLayout;
    private loadElements;
    private snapPointsToPoles;
    private resolvePath;
    private routeEnds;
    private syncConnections;
    private connectionsByCable;
    create(dto: CreateCableDto): Promise<{
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
        calculatedLengthMeters: Prisma.Decimal | null;
        technicalLengthMeters: Prisma.Decimal | null;
        color: string;
        version: number;
        path: {
            lat: number;
            lng: number;
        }[];
    }>;
    private attachPath;
    findAll(query?: {
        projectId?: string;
    }): Promise<{
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
        calculatedLengthMeters: Prisma.Decimal | null;
        technicalLengthMeters: Prisma.Decimal | null;
        color: string;
        version: number;
        path: {
            lat: number;
            lng: number;
        }[];
    }[]>;
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
        calculatedLengthMeters: Prisma.Decimal | null;
        technicalLengthMeters: Prisma.Decimal | null;
        color: string;
        version: number;
        path: {
            lat: number;
            lng: number;
        }[];
    }>;
    updateConnection(cableId: string, connectionId: string, dto: UpdateCableConnectionDto): Promise<{
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
        calculatedLengthMeters: Prisma.Decimal | null;
        technicalLengthMeters: Prisma.Decimal | null;
        color: string;
        version: number;
        path: {
            lat: number;
            lng: number;
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
            calculatedLengthMeters: Prisma.Decimal | null;
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
            attenuationDbPerKm: Prisma.Decimal | null;
            description: string | null;
            tube: {
                number: number;
                color: string;
                label: string | null;
            };
            connections: {
                id: string;
                status: string;
                lengthMeters: Prisma.Decimal | null;
                lossDb: Prisma.Decimal | null;
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
            calculatedLengthMeters: Prisma.Decimal | null;
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
            attenuationDbPerKm: Prisma.Decimal | null;
            description: string | null;
            tube: {
                number: number;
                color: string;
                label: string | null;
            };
            connections: {
                id: string;
                status: string;
                lengthMeters: Prisma.Decimal | null;
                lossDb: Prisma.Decimal | null;
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
    update(id: string, dto: UpdateCableDto): Promise<{
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
        calculatedLengthMeters: Prisma.Decimal | null;
        technicalLengthMeters: Prisma.Decimal | null;
        color: string;
        version: number;
        path: {
            lat: number;
            lng: number;
        }[];
    }>;
    relayoutInventory(id: string): Promise<void>;
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
        calculatedLengthMeters: Prisma.Decimal | null;
        technicalLengthMeters: Prisma.Decimal | null;
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
        calculatedLengthMeters: Prisma.Decimal | null;
        technicalLengthMeters: Prisma.Decimal | null;
        color: string;
        version: number;
    }>;
}
