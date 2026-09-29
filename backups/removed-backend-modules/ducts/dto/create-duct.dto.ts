import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class DuctPointDto {
  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  lng!: number;
}

export class CreateDuctDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  type!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => DuctPointDto)
  points!: DuctPointDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  diameterMm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ductCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  subductCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  capacity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  occupiedCapacity?: number;

  @IsOptional()
  @IsIn(['PLANNED', 'ACTIVE', 'INACTIVE', 'DAMAGED', 'REMOVED'])
  status?: string;

  @IsOptional()
  @IsString()
  installationType?: string;

  @IsOptional()
  @IsString()
  startNodeType?: string;

  @IsOptional()
  @IsString()
  startNodeId?: string;

  @IsOptional()
  @IsString()
  endNodeType?: string;

  @IsOptional()
  @IsString()
  endNodeId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
