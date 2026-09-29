import { Type } from 'class-transformer';
import { IsIn, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOltDto {
  @IsOptional() @IsString() code?: string;
  @IsString() @IsNotEmpty() name!: string;
  @Type(() => Number) @IsLatitude() latitude!: number;
  @Type(() => Number) @IsLongitude() longitude!: number;
  // Toda OLT se conecta a un puerto libre de un ODF: de ahí parte la red.
  @IsString() @IsNotEmpty() odfPortId!: string;
  @IsOptional() @IsString() manufacturer?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsString() serialNumber?: string;
  @IsOptional() @IsString() managementIp?: string;
  @IsOptional() @IsString() description?: string;
}

export class UpdateOltDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @Type(() => Number) @IsLatitude() latitude?: number;
  @IsOptional() @Type(() => Number) @IsLongitude() longitude?: number;
  @IsOptional() @IsString() @IsNotEmpty() odfPortId?: string;
  @IsOptional() @IsIn(['ACTIVE', 'INACTIVE', 'FAULTY']) status?: string;
  @IsOptional() @IsString() manufacturer?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsString() description?: string;
}
