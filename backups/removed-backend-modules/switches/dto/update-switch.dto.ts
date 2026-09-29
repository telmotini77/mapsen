import { PartialType } from '@nestjs/mapped-types';
import { CreateSwitchDto } from './create-switch.dto.js';

export class UpdateSwitchDto extends PartialType(CreateSwitchDto) {}
