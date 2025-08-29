import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnterpriseDto {
  @ApiProperty({ description: '企业名称', example: '绿色蔬菜种植基地' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '法人或负责人', example: '张三' })
  @IsString()
  @IsNotEmpty()
  contacts: string;

  @ApiProperty({ description: '联系电话', example: '13800138001' })
  @IsString()
  @IsNotEmpty()
  tel: string;

  @ApiProperty({ description: '营业执照号', example: 'L123456789' })
  @IsString()
  @IsNotEmpty()
  license: string;

  @ApiProperty({ description: '地址', example: '北京市朝阳区绿色农业园区A区' })
  @IsString()
  @IsNotEmpty()
  address: string;
} 