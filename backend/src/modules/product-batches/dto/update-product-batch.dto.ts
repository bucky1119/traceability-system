import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateProductBatchDto {
  @IsString()
  @IsOptional()
  vegetableName?: string;

  @IsString()
  @IsOptional()
  vegetableVariety?: string;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsDateString()
  @IsOptional()
  plantingTime?: Date;

  @IsDateString()
  @IsOptional()
  harvestTime?: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
