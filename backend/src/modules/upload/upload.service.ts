import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  async saveImage(file: Express.Multer.File): Promise<string> {
    // 返回图片的访问URL
    const baseUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    return `${baseUrl}/uploads/images/${file.filename}`;
  }
} 