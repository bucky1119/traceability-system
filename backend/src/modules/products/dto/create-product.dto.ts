import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: '产品名称', example: '有机黄瓜' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '批次编号', example: 'BATCH20240301001' })
  @IsString()
  @IsNotEmpty()
  batchCode: string;

  @ApiProperty({ description: '产品图片URL', example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: '生产者ID', example: 2 })
  @IsNumber()
  @IsNotEmpty()
  producerId: number;

  @ApiProperty({ description: '产地', example: '北京市朝阳区绿色农业园区' })
  @IsString()
  @IsOptional()
  origin?: string;

  @ApiProperty({ description: '种植日期', example: '2024-01-15' })
  @IsDateString()
  @IsOptional()
  plantingDate?: Date;

  @ApiProperty({ description: '采收日期', example: '2024-03-15' })
  @IsDateString()
  @IsOptional()
  harvestDate?: Date;

  @ApiProperty({ description: '检测类型', example: '农残检测' })
  @IsString()
  @IsOptional()
  testType?: string;

  @ApiProperty({ description: '检测日期', example: '2024-03-10' })
  @IsDateString()
  @IsOptional()
  testDate?: Date;

  @ApiProperty({ description: '检测报告URL', example: 'https://example.com/report.pdf' })
  @IsString()
  @IsOptional()
  testReport?: string;

  @ApiProperty({ description: '是否合格', example: true })
  @IsBoolean()
  @IsOptional()
  isQualified?: boolean;

  @ApiProperty({ description: '安全风险因子检测', example: '重金属含量：铅<0.1mg/kg，镉<0.05mg/kg' })
  @IsString()
  @IsOptional()
  safetyRiskTest?: string;

  @ApiProperty({ description: '产品成分检测', example: '蛋白质：2.1g/100g，维生素C：15mg/100g' })
  @IsString()
  @IsOptional()
  ingredientTest?: string;

  @ApiProperty({ description: '录入者ID（管理员录入时使用）', example: 1 })
  @IsNumber()
  @IsOptional()
  createdBy?: number;

  @ApiProperty({ description: '批次备注信息', example: '春季第一批种植' })
  @IsString()
  @IsOptional()
  batchNotes?: string;
} 