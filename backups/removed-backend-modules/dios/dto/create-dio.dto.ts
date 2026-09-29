import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateDioDto {
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() popId?: string;
  @IsOptional() @IsString() rackId?: string;
  @IsOptional() @IsString() code?: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) capacity?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) usedPorts?: number;
  @IsOptional() @IsIn(['PLANNED', 'ACTIVE', 'INACTIVE', 'REMOVED']) status?: string;
  @IsOptional() @IsString() description?: string;
}
