import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductBatch } from './entities/product-batch.entity';
import { CreateProductBatchDto } from './dto/create-product-batch.dto';
import { UpdateProductBatchDto } from './dto/update-product-batch.dto';
import { SafetyInspection } from '../safety-inspections/entities/safety-inspection.entity';
import { QrCode } from '../qr-codes/entities/qr-code.entity';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Producer } from '../producers/entities/producer.entity';

@Injectable()
export class ProductBatchesService {
  constructor(
    @InjectRepository(ProductBatch)
    private productBatchesRepository: Repository<ProductBatch>,
    @InjectRepository(SafetyInspection)
    private safetyInspectionsRepository: Repository<SafetyInspection>,
    @InjectRepository(QrCode)
    private qrCodesRepository: Repository<QrCode>,
    @InjectRepository(Producer)
    private producersRepository: Repository<Producer>,
  ) {}

  async create(createProductBatchDto: CreateProductBatchDto): Promise<ProductBatch> {
    // 校验生产者是否存在（管理员传入的 producerId 或控制器为生产者自动设置的 id）
    if (!createProductBatchDto.producerId) {
      throw new NotFoundException('必须指定生产者');
    }
    const producer = await this.producersRepository.findOne({ where: { id: createProductBatchDto.producerId } });
    if (!producer) {
      throw new NotFoundException('指定的生产者不存在');
    }
    const batch = this.productBatchesRepository.create(createProductBatchDto);
    return this.productBatchesRepository.save(batch);
  }

  findAll(): Promise<ProductBatch[]> {
    return this.productBatchesRepository.find({ relations: ['producer', 'safetyInspections', 'qrCodes'] });
  }

  findByProducer(producerId: number): Promise<ProductBatch[]> {
    return this.productBatchesRepository.find({ 
      where: { producerId },
      relations: ['producer', 'safetyInspections', 'qrCodes']
    });
  }

  findOne(id: number): Promise<ProductBatch> {
    return this.productBatchesRepository.findOne({ 
      where: { id },
      relations: ['producer', 'safetyInspections', 'qrCodes'] 
    });
  }

  async update(id: number, dto: UpdateProductBatchDto, user: { id: number; role: string }): Promise<ProductBatch> {
    const batch = await this.productBatchesRepository.findOne({ where: { id } });
    if (!batch) throw new NotFoundException('产品批次不存在');
    if (user?.role === 'producer' && batch.producerId !== user.id) {
      throw new ForbiddenException('无权修改他人的产品批次');
    }
    // 如果上传了新图片，删除旧图片
    if (dto.imageUrl && batch.imageUrl && dto.imageUrl !== batch.imageUrl) {
      const oldPath = join(process.cwd(), batch.imageUrl.replace(/^\//, ''));
      try { await fs.unlink(oldPath); } catch {}
    }
    const merged = this.productBatchesRepository.merge(batch, dto);
    return this.productBatchesRepository.save(merged);
  }

  async remove(id: number, user: { id: number; role: string }): Promise<void> {
    const batch = await this.productBatchesRepository.findOne({ where: { id } });
    if (!batch) throw new NotFoundException('产品批次不存在');
    if (user?.role === 'producer' && batch.producerId !== user.id) {
      throw new ForbiddenException('无权删除他人的产品批次');
    }
    // 删除产品图片
    if (batch.imageUrl) {
      const imgPath = join(process.cwd(), batch.imageUrl.replace(/^\//, ''));
      try { await fs.unlink(imgPath); } catch {}
    }
    // 删除关联安全检测及其图片
    const inspections = await this.safetyInspectionsRepository.find({ where: { batchId: id } });
    for (const it of inspections) {
      if (it.result_image_url) {
        const p = join(process.cwd(), it.result_image_url.replace(/^\//, ''));
        try { await fs.unlink(p); } catch {}
      }
    }
    await this.safetyInspectionsRepository.delete({ batchId: id });
    // 删除关联二维码及其图片
    const qrs = await this.qrCodesRepository.find({ where: { batchId: id } });
    for (const q of qrs) {
      const fileName = `${q.codeData}.png`;
      const p = join(process.cwd(), 'uploads', 'qrcodes', fileName);
      try { await fs.unlink(p); } catch {}
    }
    await this.qrCodesRepository.delete({ batchId: id });
    // 最后删除批次
    await this.productBatchesRepository.delete(id);
  }

  async exportCsv(filterProducerId: number | undefined, user: { id: number; role: string }) {
    let list: ProductBatch[];
    if (user.role === 'producer') {
      list = await this.productBatchesRepository.find({ where: { producerId: user.id } });
    } else {
      list = await this.productBatchesRepository.find({ where: filterProducerId ? { producerId: filterProducerId } : {} });
    }
    const headers = ['id','producerId','vegetableName','vegetableVariety','origin','plantingTime','harvestTime','description','imageUrl','createdAt','updatedAt'];
    const rows = list.map(b => [
      b.id,
      b.producerId,
      b.vegetableName,
      b.vegetableVariety ?? '',
      (b.origin ?? '').replace(/\n/g,' '),
      b.plantingTime?.toISOString?.() ?? '',
      b.harvestTime?.toISOString?.() ?? '',
      (b.description ?? '').replace(/\n/g,' '),
      b.imageUrl ?? '',
      b.createdAt?.toISOString?.() ?? '',
      b.updatedAt?.toISOString?.() ?? '',
    ]);
    const csvLines = [headers.join(','), ...rows.map(r => r.map(v => typeof v === 'string' && v.includes(',') ? '"'+v.replace(/"/g,'""')+'"' : v).join(','))];
    const bom = '\uFEFF';
    return { filename: 'product-batches.csv', content: bom + csvLines.join('\n'), mime: 'text/csv; charset=utf-8' };
  }
}
