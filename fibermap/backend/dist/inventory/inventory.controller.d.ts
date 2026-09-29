import { InventoryService } from './inventory.service.js';
import { CreateInventoryDto } from './dto/create-inventory.dto.js';
import { UpdateInventoryDto } from './dto/update-inventory.dto.js';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    create(createInventoryDto: CreateInventoryDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateInventoryDto: UpdateInventoryDto): string;
    remove(id: string): string;
}
