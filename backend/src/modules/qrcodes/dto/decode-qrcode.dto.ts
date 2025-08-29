import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DecodeQrcodeDto {
  @ApiProperty({ 
    description: '二维码数据内容', 
    example: '{"qrcodeId":"xxx","product":{"name":"有机黄瓜"},"batch":{"batchCode":"BATCH001"}}' 
  })
  @IsString()
  @IsNotEmpty()
  qrcodeData: string;
} 