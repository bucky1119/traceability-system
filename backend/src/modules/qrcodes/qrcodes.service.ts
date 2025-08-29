import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

import { Qrcode, QrcodeStatus } from './entities/qrcode.entity';
import { Batch } from '../batches/entities/batch.entity';
import { Product } from '../products/entities/product.entity';
import { CreateQrcodeDto } from './dto/create-qrcode.dto';
import { UpdateQrcodeDto } from './dto/update-qrcode.dto';

@Injectable()
export class QrcodesService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'qrcodes');

  constructor(
    @InjectRepository(Qrcode)
    private readonly qrcodeRepository: Repository<Qrcode>,
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    // 确保上传目录存在
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private async saveQrcodeImage(qrcodeId: string, qrcodeBuffer: Buffer): Promise<{
    imagePath: string;
    imageUrl: string;
    imageSize: number;
  }> {
    const filename = `qrcode_${qrcodeId}.png`;
    const filePath = path.join(this.uploadDir, filename);
    
    // 保存图片文件
    fs.writeFileSync(filePath, qrcodeBuffer);
    
    // 构建访问URL - 使用静态文件服务
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const imageUrl = `${baseUrl}/uploads/qrcodes/${filename}`;
    
    return {
      imagePath: filePath,
      imageUrl,
      imageSize: qrcodeBuffer.length,
    };
  }

  async create(createQrcodeDto: CreateQrcodeDto): Promise<Qrcode> {
    const { batchId, productId } = createQrcodeDto;
    
    // 验证批次是否存在
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
    });
    if (!batch) {
      throw new NotFoundException('批次不存在');
    }

    // 验证产品是否存在
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['producer', 'producer.enterprise'],
    });
    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    // 验证批次是否属于该产品
    if (batch.productId !== productId) {
      throw new BadRequestException('批次与产品不匹配');
    }
    
    // 生成唯一的二维码ID
    const qrcodeId = uuidv4();
    
    // 构建完整的溯源信息数据
    const traceabilityData = {
      qrcodeId: qrcodeId,
      generateTime: new Date().toISOString(),
      product: {
        id: product.id,
        name: product.name,
        origin: product.origin,
        plantingDate: product.plantingDate,
        harvestDate: product.harvestDate,
        testType: product.testType,
        testDate: product.testDate,
        isQualified: product.isQualified,
        imageUrl: product.imageUrl,
        producer: {
          id: product.producer?.id,
          username: product.producerName || product.producer?.username,
          tel: product.producerTel || product.producer?.tel,
          enterprise: product.producerEnterprise || product.producer?.enterprise?.name,
        },
      },
      batch: {
        id: batch.id,
        batchCode: batch.batchCode,
        productId: batch.productId,
        createTime: batch.createTime,
        notes: batch.notes,
      },
      // 添加在线查询链接作为备用
      onlineQueryUrl: `${process.env.QRCODE_BASE_URL || 'https://your-domain.com/trace'}/${qrcodeId}`,
    };
    
    // 将溯源信息转换为JSON字符串
    const traceabilityJson = JSON.stringify(traceabilityData, null, 2);
    
    // 生成二维码图片数据（直接存储溯源信息）
    const qrcodeDataUrl = await QRCode.toDataURL(traceabilityJson, {
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 512 // 增加尺寸以容纳更多数据
    });

    // 生成二维码图片Buffer并保存到文件系统
    const qrcodeBuffer = await QRCode.toBuffer(traceabilityJson, {
      type: 'png',
      margin: 1,
      width: 512
    });

    // 保存二维码图片文件
    const { imagePath, imageUrl, imageSize } = await this.saveQrcodeImage(qrcodeId, qrcodeBuffer);
    
    const qrcode = this.qrcodeRepository.create({
      ...createQrcodeDto,
      qrcodeId,
      link: traceabilityJson, // 存储完整的溯源信息
      qrcodeDataUrl,
      qrcodeImageUrl: imageUrl,
      qrcodeImagePath: imagePath,
      qrcodeImageSize: imageSize,
      status: QrcodeStatus.ACTIVE,
    });
    
    const savedQrcode = await this.qrcodeRepository.save(qrcode);
    
    // 返回包含关联数据的完整信息
    return this.qrcodeRepository.findOne({
      where: { id: savedQrcode.id },
      relations: ['batch', 'product', 'product.producer'],
    });
  }

  async findAll(): Promise<Qrcode[]> {
    return this.qrcodeRepository.find({
      relations: ['batch', 'product'],
    });
  }

  async findOne(id: number): Promise<Qrcode> {
    const qrcode = await this.qrcodeRepository.findOne({
      where: { id },
      relations: ['batch', 'product'],
    });

    if (!qrcode) {
      throw new NotFoundException('二维码不存在');
    }

    return qrcode;
  }

  async findByQrcodeId(qrcodeId: string): Promise<Qrcode> {
    const qrcode = await this.qrcodeRepository.findOne({
      where: { qrcodeId },
      relations: ['batch', 'product', 'product.producer'],
    });

    if (!qrcode) {
      throw new NotFoundException('二维码不存在');
    }

    return qrcode;
  }

  async update(id: number, updateQrcodeDto: UpdateQrcodeDto): Promise<Qrcode> {
    await this.findOne(id);
    await this.qrcodeRepository.update(id, updateQrcodeDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const qrcode = await this.findOne(id);
    await this.qrcodeRepository.remove(qrcode);
  }

  async findByBatch(batchId: number): Promise<Qrcode[]> {
    return this.qrcodeRepository.find({
      where: { batchId },
      relations: ['batch', 'product'],
    });
  }

  async findByProduct(productId: number): Promise<Qrcode[]> {
    return this.qrcodeRepository.find({
      where: { productId },
      relations: ['batch', 'product'],
    });
  }

  async findByStatus(status: QrcodeStatus): Promise<Qrcode[]> {
    return this.qrcodeRepository.find({
      where: { status },
      relations: ['batch', 'product'],
    });
  }

  async incrementScanCount(qrcodeId: string): Promise<void> {
    const qrcode = await this.findByQrcodeId(qrcodeId);
    await this.qrcodeRepository.update(qrcode.id, {
      scanCount: qrcode.scanCount + 1,
      lastScanTime: new Date(),
    });
  }

  async generateQrcodeImage(qrcodeId: string): Promise<string> {
    const qrcode = await this.findByQrcodeId(qrcodeId);
    return QRCode.toDataURL(qrcode.link, {
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 512
    });
  }

  async generateQrcodeBuffer(qrcodeId: string): Promise<Buffer> {
    const qrcode = await this.findByQrcodeId(qrcodeId);
    return QRCode.toBuffer(qrcode.link, {
      type: 'png',
      margin: 1,
      width: 512
    });
  }

  // 新增：获取二维码图片文件
  async getQrcodeImageFile(qrcodeId: string): Promise<Buffer> {
    const qrcode = await this.findByQrcodeId(qrcodeId);
    
    if (qrcode.qrcodeImagePath && fs.existsSync(qrcode.qrcodeImagePath)) {
      return fs.readFileSync(qrcode.qrcodeImagePath);
    }
    
    // 如果文件不存在，重新生成
    const qrcodeBuffer = await this.generateQrcodeBuffer(qrcodeId);
    const { imagePath } = await this.saveQrcodeImage(qrcodeId, qrcodeBuffer);
    
    // 更新数据库记录
    await this.qrcodeRepository.update(qrcode.id, {
      qrcodeImagePath: imagePath,
      qrcodeImageSize: qrcodeBuffer.length,
    });
    
    return qrcodeBuffer;
  }

  // 新增：获取二维码图片信息
  async getQrcodeImageInfo(qrcodeId: string): Promise<{
    imageUrl: string;
    imageSize: number;
    generateTime: Date;
    filename: string;
  }> {
    const qrcode = await this.findByQrcodeId(qrcodeId);
    
    return {
      imageUrl: qrcode.qrcodeImageUrl,
      imageSize: qrcode.qrcodeImageSize,
      generateTime: qrcode.generateTime,
      filename: `qrcode_${qrcodeId}.png`,
    };
  }

  async getQrcodeStats(): Promise<any> {
    const totalQrcodes = await this.qrcodeRepository.count();
    const activeQrcodes = await this.qrcodeRepository.count({
      where: { status: QrcodeStatus.ACTIVE },
    });
    const totalScans = await this.qrcodeRepository
      .createQueryBuilder('qrcode')
      .select('SUM(qrcode.scanCount)', 'total')
      .getRawOne();

    return {
      total: totalQrcodes,
      active: activeQrcodes,
      inactive: totalQrcodes - activeQrcodes,
      totalScans: parseInt(totalScans.total) || 0,
    };
  }

  async batchGenerate(batchId: number, count: number): Promise<Qrcode[]> {
    const qrcodes = [];
    
    for (let i = 0; i < count; i++) {
      const qrcode = await this.create({
        batchId,
        productId: 0, // 需要从批次中获取产品ID
      });
      qrcodes.push(qrcode);
    }
    
    return qrcodes;
  }
}