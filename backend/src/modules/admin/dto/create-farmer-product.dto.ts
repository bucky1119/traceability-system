import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFarmerProductDto {
  @ApiProperty({ description: '农户ID' })
  @IsNotEmpty()
  farmerId: number;

  @ApiProperty({ description: '产品名称' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: '批次编号' })
  @IsNotEmpty()
  @IsString()
  batchCode: string;

  @ApiProperty({ description: '产地', required: false })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiProperty({ description: '种植日期', required: false })
  @IsOptional()
  @IsDateString()
  plantingDate?: string;

  @ApiProperty({ description: '收获日期', required: false })
  @IsOptional()
  @IsDateString()
  harvestDate?: string;

  @ApiProperty({ description: '检测类型', required: false })
  @IsOptional()
  @IsString()
  testType?: string;

  @ApiProperty({ description: '检测日期', required: false })
  @IsOptional()
  @IsDateString()
  testDate?: string;

  @ApiProperty({ description: '是否合格' })
  @IsBoolean()
  isQualified: boolean;

  @ApiProperty({ description: '产品图片URL', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: '产品描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;
} 