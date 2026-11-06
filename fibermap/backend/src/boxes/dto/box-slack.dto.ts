import { IsNumber, IsPositive, IsString, IsNotEmpty } from 'class-validator';
export class UpdateBoxSlackDto {
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  meters!: number;
}
export class CreateBoxSlackDto extends UpdateBoxSlackDto {
  @IsString()
  @IsNotEmpty()
  cableId!: string;
}
