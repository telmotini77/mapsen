import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateSwitchDto {
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() popId?: string;
  @IsOptional() @IsString() rackId?: string;
  @IsOptional() @IsString() code?: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsString() managementIp?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) portCount?: number;
  @IsOptional() @IsIn(['PLANNED', 'ACTIVE', 'INACTIVE', 'FAULTY', 'REMOVED']) status?: string;
  @IsOptional() @IsString() description?: string;
}
