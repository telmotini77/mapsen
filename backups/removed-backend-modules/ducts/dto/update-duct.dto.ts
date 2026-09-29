import { PartialType } from '@nestjs/mapped-types';
import { CreateDuctDto } from './create-duct.dto.js';

export class UpdateDuctDto extends PartialType(CreateDuctDto) {}
