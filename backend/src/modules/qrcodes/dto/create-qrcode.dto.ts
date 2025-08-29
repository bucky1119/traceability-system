import { IsNumber, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQrcodeDto {
  @ApiProperty({ description: '批次ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  batchId: number;

  @ApiProperty({ description: '产品ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ description: '过期时间', example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  expireTime?: Date;
} 