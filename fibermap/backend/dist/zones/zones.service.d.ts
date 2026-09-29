import { CreateZoneDto } from './dto/create-zone.dto.js';
import { UpdateZoneDto } from './dto/update-zone.dto.js';
export declare class ZonesService {
    create(createZoneDto: CreateZoneDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateZoneDto: UpdateZoneDto): string;
    remove(id: number): string;
}
