import { TubesService } from './tubes.service.js';
import { CreateTubeDto } from './dto/create-tube.dto.js';
import { UpdateTubeDto } from './dto/update-tube.dto.js';
export declare class TubesController {
    private readonly tubesService;
    constructor(tubesService: TubesService);
    create(createTubeDto: CreateTubeDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateTubeDto: UpdateTubeDto): string;
    remove(id: string): string;
}
