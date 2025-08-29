import { IsString, IsNotEmpty, MinLength, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
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
  @IsNotEmpty()
  roleId: number;

  @ApiProperty({ description: '企业ID', example: 1 })
  @IsNumber()
  @IsOptional()
  enterpriseId?: number;
} 