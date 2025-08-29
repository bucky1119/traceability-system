import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBatchDto {
  @ApiProperty({ description: '批次编号', example: '202401001' })
  @IsString()
  @IsNotEmpty()
  batchCode: string;

  @ApiProperty({ description: '产品ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ description: '备注信息', example: '春季第一批有机黄瓜' })
  @IsString()
  @IsOptional()
  notes?: string;
} 