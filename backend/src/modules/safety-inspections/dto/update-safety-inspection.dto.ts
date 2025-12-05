import { IsNotEmpty, IsString, IsDateString, IsOptional, IsIn } from 'class-validator';

export class UpdateSafetyInspectionDto {
  @IsString()
  @IsOptional()
  riskFactorType?: string;

  @IsDateString()
  @IsOptional()
  inspectionTime?: Date;

  @IsString()
  @IsOptional()
  resultImageUrl?: string;

  @IsIn(['合格', '不合格'])
  @IsOptional()
  manualResult?: '合格' | '不合格';

  @IsString()
  @IsOptional()
  componentAnalysis?: string;
}
