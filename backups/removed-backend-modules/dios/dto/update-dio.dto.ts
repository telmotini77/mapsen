import { PartialType } from '@nestjs/mapped-types';
import { CreateDioDto } from './create-dio.dto.js';

export class UpdateDioDto extends PartialType(CreateDioDto) {}
