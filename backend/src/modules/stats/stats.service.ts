import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producer } from '../producers/entities/producer.entity';
import { ProductBatch } from '../product-batches/entities/product-batch.entity';
import { QrCode } from '../qr-codes/entities/qr-code.entity';
import { SafetyInspection } from '../safety-inspections/entities/safety-inspection.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Producer) private producerRepo: Repository<Producer>,
    @InjectRepository(ProductBatch) private batchRepo: Repository<ProductBatch>,
    @InjectRepository(QrCode) private qrRepo: Repository<QrCode>,
    @InjectRepository(SafetyInspection) private inspectionRepo: Repository<SafetyInspection>,
  ) {}

  async getDashboard() {
    const [totalProducers, totalProducts, totalQrcodes, totalInspections] = await Promise.all([
      this.producerRepo.count(),
      this.batchRepo.count(),
      this.qrRepo.count(),
      this.inspectionRepo.count(),
    ]);

    // 粗略统计：按检测结果聚合（以检测记录为单位）
    const qualifiedProducts = await this.inspectionRepo.count({ where: { manualResult: '合格' as any } });
    const unqualifiedProducts = await this.inspectionRepo.count({ where: { manualResult: '不合格' as any } });

    return {
      totalProducers,
      totalProducts,
      totalQrcodes,
      totalInspections,
      totalScans: 0, // 暂无扫码日志，先返回0
      qualifiedProducts,
      unqualifiedProducts,
    };
  }
}
