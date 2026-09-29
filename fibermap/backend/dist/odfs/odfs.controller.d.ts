import { OdfsService } from './odfs.service.js';
import { CreateOdfDto, UpdateOdfDto } from './dto/create-odf.dto.js';
export declare class OdfsController {
    private readonly odfsService;
    constructor(odfsService: OdfsService);
    create(dto: CreateOdfDto): Promise<{
        ports: {
            number: number;
            status: string;
            id: string;
            notes: string | null;
            label: string | null;
            odfId: string;
            connectorType: string | null;
        }[];
    } & {
        code: string;
        name: string;
        description: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        projectId: string;
        capacity: number;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        code: string;
        name: string;
        description: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        projectId: string;
        capacity: number;
    }[]>;
    table(id: string): Promise<{
        device: {
            id: string;
            kind: "ODF";
            code: string;
            name: string;
            capacity: number;
            status: string;
        };
        portsInUse: number;
        cables: import("../cables/connections-table.service.js").ConnectionsTableCable[];
        terminals: import("../cables/connections-table.service.js").DeviceTerminal[];
    }>;
    findOne(id: string): Promise<{
        ports: {
            number: number;
            status: string;
            id: string;
            notes: string | null;
            label: string | null;
            odfId: string;
            connectorType: string | null;
        }[];
    } & {
        code: string;
        name: string;
        description: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        projectId: string;
        capacity: number;
    }>;
    update(id: string, dto: UpdateOdfDto): Promise<{
        code: string;
        name: string;
        description: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        projectId: string;
        capacity: number;
    }>;
    remove(id: string): Promise<{
        code: string;
        name: string;
        description: string | null;
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        latitude: import("@prisma/client/runtime/library").Decimal;
        longitude: import("@prisma/client/runtime/library").Decimal;
        projectId: string;
        capacity: number;
    }>;
}
