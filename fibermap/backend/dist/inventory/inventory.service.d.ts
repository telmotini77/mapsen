import { CreateInventoryDto } from './dto/create-inventory.dto.js';
import { UpdateInventoryDto } from './dto/update-inventory.dto.js';
export declare class InventoryService {
    create(createInventoryDto: CreateInventoryDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateInventoryDto: UpdateInventoryDto): string;
    remove(id: number): string;
}
