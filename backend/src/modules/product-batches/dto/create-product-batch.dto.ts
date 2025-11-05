import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateProductBatchDto {
  @IsNumber()
  @IsOptional()
  producerId?: number;

  @IsString()
  @IsNotEmpty()
  vegetableName: string;

  @IsString()
  @IsOptional()
  vegetableVariety?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsDateString()
  @IsNotEmpty()
  plantingTime: Date;

  @IsDateString()
  @IsNotEmpty()
  harvestTime: Date;

  @IsString()
  @IsOptional()
  description?: string;
}
