import { RegionsService } from './regions.service.js';
import { CreateRegionDto } from './dto/create-region.dto.js';
import { UpdateRegionDto } from './dto/update-region.dto.js';
export declare class RegionsController {
    private readonly regionsService;
    constructor(regionsService: RegionsService);
    create(createRegionDto: CreateRegionDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateRegionDto: UpdateRegionDto): string;
    remove(id: string): string;
}
