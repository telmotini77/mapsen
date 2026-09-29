import { PartialType } from '@nestjs/mapped-types';
import { CreatePopDto } from './create-pop.dto.js';

export class UpdatePopDto extends PartialType(CreatePopDto) {}
