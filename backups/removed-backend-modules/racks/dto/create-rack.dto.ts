import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateRackDto {
  @IsOptional() @IsString() projectId?: string;
  @IsString() @IsNotEmpty() popId!: string;
  @IsOptional() @IsString() code?: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) rackUnits?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) usedUnits?: number;
  @IsOptional() @IsIn(['PLANNED', 'ACTIVE', 'INACTIVE', 'REMOVED']) status?: string;
  @IsOptional() @IsString() description?: string;
}
