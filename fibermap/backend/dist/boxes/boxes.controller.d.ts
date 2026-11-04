import { BoxSlacksService } from './box-slacks.service.js';
import { CreateBoxSlackDto, UpdateBoxSlackDto } from './dto/box-slack.dto.js';
import { BoxesService } from './boxes.service.js';
import { CreateBoxDto, UpdateBoxDto } from './dto/create-box.dto.js';
export declare class BoxesController {
    private readonly boxesService;
    private readonly slacks;
    constructor(boxesService: BoxesService, slacks: BoxSlacksService);
    create(createBoxDto: CreateBoxDto): Promise<{
        splitters: {
            id: string;
            code: string;
            name: string | null;
            status: string;
            manufacturerId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            projectId: string;
            ratio: string;
            splitterType: string;
            inputCount: number;
            outputCount: number;
            insertionLossDb: import("@prisma/client/runtime/library").Decimal | null;
            model: string | null;
            version: number;
            boxId: string | null;
        }[];
    } & {
        id: string;
        code: string;
        name: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        type: string;
        mangaType: string | null;
        status: string;
        description: string | null;
        capacity: number | null;
        portCapacity: number;
        usedPorts: number;
        installationType: string | null;
        manufacturerId: string | null;
        equipmentModelId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
    }>;
    findAll(): Promise<({
        splitters: {
            id: string;
            code: string;
            ratio: string;
        }[];
    } & {
        id: string;
        code: string;
        name: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        type: string;
        mangaType: string | null;
        status: string;
        description: string | null;
        capacity: number | null;
        portCapacity: number;
        usedPorts: number;
        installationType: string | null;
        manufacturerId: string | null;
        equipmentModelId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
    })[]>;
    mapSlacks(): Promise<{
        id: string;
        boxId: string;
        cableId: string;
        cableCode: string;
        meters: number;
    }[]>;
    listSlacks(id: string): Promise<{
        reservations: {
            id: string;
            boxId: string;
            cableId: string;
            cableCode: string;
            meters: number;
        }[];
        cables: {
            id: string;
            code: string;
        }[];
    }>;
    createSlack(id: string, dto: CreateBoxSlackDto): Promise<{
        id: string;
        cableId: string;
        locationType: string;
        locationId: string;
        meters: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    updateSlack(id: string, slackId: string, dto: UpdateBoxSlackDto): Promise<{
        id: string;
        cableId: string;
        locationType: string;
        locationId: string;
        meters: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    removeSlack(id: string, slackId: string): Promise<{
        id: string;
        cableId: string;
        locationType: string;
        locationId: string;
        meters: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    table(id: string): Promise<{
        device: {
            id: string;
            kind: "MANGA" | "NAP";
            code: string;
            name: string | null;
            mangaType: string | null;
            capacity: number | null;
            status: string;
        };
        portsInUse: number;
        cables: import("../cables/connections-table.service.js").ConnectionsTableCable[];
        terminals: import("../cables/connections-table.service.js").DeviceTerminal[];
    }>;
    findOne(id: string): Promise<{
        ports: {
            number: number;
            id: string;
            type: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            label: string | null;
            boxId: string;
            notes: string | null;
            direction: string | null;
        }[];
        splitters: ({
            ports: {
                number: number;
                id: string;
                status: string;
                createdAt: Date;
                portType: string;
                label: string | null;
                lossDb: import("@prisma/client/runtime/library").Decimal | null;
                splitterId: string;
            }[];
        } & {
            id: string;
            code: string;
            name: string | null;
            status: string;
            manufacturerId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            projectId: string;
            ratio: string;
            splitterType: string;
            inputCount: number;
            outputCount: number;
            insertionLossDb: import("@prisma/client/runtime/library").Decimal | null;
            model: string | null;
            version: number;
            boxId: string | null;
        })[];
        opticalTerminations: {
            id: string;
            type: string;
            createdAt: Date;
            boxId: string | null;
            entityType: string;
            entityId: string;
            portIdentifier: string | null;
            odfId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        code: string;
        name: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        type: string;
        mangaType: string | null;
        status: string;
        description: string | null;
        capacity: number | null;
        portCapacity: number;
        usedPorts: number;
        installationType: string | null;
        manufacturerId: string | null;
        equipmentModelId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
    }>;
    update(id: string, updateBoxDto: UpdateBoxDto): Promise<{
        id: string;
        code: string;
        name: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        type: string;
        mangaType: string | null;
        status: string;
        description: string | null;
        capacity: number | null;
        portCapacity: number;
        usedPorts: number;
        installationType: string | null;
        manufacturerId: string | null;
        equipmentModelId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
    }>;
    generatePorts(id: string, body: {
        count: number;
        type?: string;
    }): Promise<{
        ports: {
            number: number;
            id: string;
            type: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            label: string | null;
            boxId: string;
            notes: string | null;
            direction: string | null;
        }[];
    } & {
        id: string;
        code: string;
        name: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        type: string;
        mangaType: string | null;
        status: string;
        description: string | null;
        capacity: number | null;
        portCapacity: number;
        usedPorts: number;
        installationType: string | null;
        manufacturerId: string | null;
        equipmentModelId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        code: string;
        name: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        type: string;
        mangaType: string | null;
        status: string;
        description: string | null;
        capacity: number | null;
        portCapacity: number;
        usedPorts: number;
        installationType: string | null;
        manufacturerId: string | null;
        equipmentModelId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
    }>;
}
