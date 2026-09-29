import { ZonesService } from './zones.service.js';
import { CreateZoneDto } from './dto/create-zone.dto.js';
import { UpdateZoneDto } from './dto/update-zone.dto.js';
export declare class ZonesController {
    private readonly zonesService;
    constructor(zonesService: ZonesService);
    create(createZoneDto: CreateZoneDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateZoneDto: UpdateZoneDto): string;
    remove(id: string): string;
}
