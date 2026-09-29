import { Type } from 'class-transformer';
import { IsIn, IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePoleDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @Type(() => Number)
  @IsLatitude()
  latitude!: number;

  @Type(() => Number)
  @IsLongitude()
  longitude!: number;

  @IsOptional()
  @IsIn(['WOOD', 'CONCRETE', 'STEEL', 'FIBERGLASS', 'OTHER'])
  material?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  height?: number;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsIn(['PLANNED', 'ACTIVE', 'INACTIVE', 'DAMAGED', 'REMOVED'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
