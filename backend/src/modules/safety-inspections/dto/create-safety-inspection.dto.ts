import { IsNotEmpty, IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSafetyInspectionDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  batchId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  creatorId?: number;

  @IsNotEmpty()
  @IsString()
  riskFactorType: string;

  @IsNotEmpty()
  @IsDateString()
  inspectionTime: Date;

  @IsOptional()
  @IsString()
  resultImageUrl?: string;

  @IsNotEmpty()
  @IsString()
  manualResult: '合格' | '不合格';

  @IsOptional()
  @IsString()
  componentAnalysis?: string;
}
