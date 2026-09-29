import { PartialType } from '@nestjs/mapped-types';
import { CreateRackDto } from './create-rack.dto.js';

export class UpdateRackDto extends PartialType(CreateRackDto) {}
