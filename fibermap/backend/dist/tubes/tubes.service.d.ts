import { CreateTubeDto } from './dto/create-tube.dto.js';
import { UpdateTubeDto } from './dto/update-tube.dto.js';
export declare class TubesService {
    create(createTubeDto: CreateTubeDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateTubeDto: UpdateTubeDto): string;
    remove(id: number): string;
}
