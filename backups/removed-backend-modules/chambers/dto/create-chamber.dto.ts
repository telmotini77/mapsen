import { Type } from 'class-transformer';
import { IsIn, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChamberDto {
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

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsIn(['PLANNED', 'ACTIVE', 'INACTIVE', 'DAMAGED', 'REMOVED'])
  status?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
