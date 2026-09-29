import { Type } from 'class-transformer';
import { IsIn, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePopDto {
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() code?: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsString() address?: string;
  @Type(() => Number) @IsLatitude() latitude!: number;
  @Type(() => Number) @IsLongitude() longitude!: number;
  @IsOptional() @IsIn(['PLANNED', 'ACTIVE', 'INACTIVE', 'REMOVED']) status?: string;
  @IsOptional() @IsString() description?: string;
}
