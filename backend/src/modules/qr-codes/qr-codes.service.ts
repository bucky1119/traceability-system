import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QrCode } from './entities/qr-code.entity';
import { ProductBatchesService } from '../product-batches/product-batches.service';
import * as qrcode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class QrCodesService {
  constructor(
    @InjectRepository(QrCode)
    private qrCodeRepository: Repository<QrCode>,
    private productBatchesService: ProductBatchesService,
  ) {}

  async generateQrCodeForBatch(batchId: number, baseUrl: string): Promise<{ qrCodeEntity: QrCode; qrCodeImage: string; imageUrl: string; imageFullUrl: string }> {
    const batch = await this.productBatchesService.findOne(batchId);
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }

    const codeData = uuidv4();
  const accessUrl = `${baseUrl}/api/product-batches/${batchId}`;

    const qrCodeEntity = this.qrCodeRepository.create({
      batchId,
      codeData,
      accessUrl,
    });

    await this.qrCodeRepository.save(qrCodeEntity);

    // 生成并落盘图片
  // 统一使用与静态资源相同的 uploads 目录（兼容 src 与 dist 运行路径）
  const uploadsRoot = join(__dirname, '..', '..', '..', 'uploads');
  const dir = join(uploadsRoot, 'qrcodes');
    await fs.mkdir(dir, { recursive: true });
    const fileName = `${codeData}.png`;
  const absPath = join(dir, fileName);
    await qrcode.toFile(absPath, accessUrl, { margin: 2, width: 512 });

    // 仍返回 dataURL 以便前端即时展示
    const qrCodeImage = await qrcode.toDataURL(accessUrl);

    const imageUrl = `/uploads/qrcodes/${fileName}`; // 静态资源URL（相对）
    const imageFullUrl = `${baseUrl}${imageUrl}`;     // 绝对URL

    return { qrCodeEntity, qrCodeImage, imageUrl, imageFullUrl };
  }

  async findByCode(codeData: string): Promise<QrCode> {
    return this.qrCodeRepository.findOne({ where: { codeData }, relations: ['batch'] });
  }

  async getBatchDetailByCode(codeData: string) {
    const qr = await this.findByCode(codeData);
    if (!qr) return null;
    return this.productBatchesService.findOne(qr.batchId);
  }

  async getImageFilePathByCode(codeData: string): Promise<{ absPath: string; fileName: string }> {
    const fileName = `${codeData}.png`;
    const uploadsRoot = join(__dirname, '..', '..', '..', 'uploads');
    const absPath = join(uploadsRoot, 'qrcodes', fileName);
    return { absPath, fileName };
  }
}
