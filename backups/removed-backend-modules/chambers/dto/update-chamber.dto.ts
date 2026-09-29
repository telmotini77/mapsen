import { PartialType } from '@nestjs/mapped-types';
import { CreateChamberDto } from './create-chamber.dto.js';

export class UpdateChamberDto extends PartialType(CreateChamberDto) {}
