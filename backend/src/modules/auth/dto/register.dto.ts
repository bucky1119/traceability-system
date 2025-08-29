import { IsString, IsNotEmpty, MinLength, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: '用户名', example: 'producer1' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码', example: 'producer123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: '联系电话', example: '13800138001' })
  @IsString()
  @IsOptional()
  tel?: string;

  @ApiProperty({ description: '角色ID', example: 2 })
  @IsNumber()
  @IsOptional()
  roleId?: number;

  @ApiProperty({ description: '企业ID', example: 1 })
  @IsNumber()
  @IsOptional()
  enterpriseId?: number;

  @ApiProperty({ description: '企业名称（当选择"其他"时使用）', example: '新企业名称' })
  @IsString()
  @IsOptional()
  enterpriseName?: string;
} 