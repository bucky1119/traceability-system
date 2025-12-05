import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafetyInspection } from './entities/safety-inspection.entity';
import { CreateSafetyInspectionDto } from './dto/create-safety-inspection.dto';
import { UpdateSafetyInspectionDto } from './dto/update-safety-inspection.dto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ProductBatch } from '../product-batches/entities/product-batch.entity';

@Injectable()
export class SafetyInspectionsService {
  constructor(
    @InjectRepository(SafetyInspection)
    private safetyInspectionsRepository: Repository<SafetyInspection>,
    @InjectRepository(ProductBatch)
    private productBatchesRepository: Repository<ProductBatch>,
  ) {}

  async create(createSafetyInspectionDto: CreateSafetyInspectionDto): Promise<SafetyInspection> {
    // 校验批次是否存在
    const batch = await this.productBatchesRepository.findOne({ where: { id: createSafetyInspectionDto.batchId } });
    if (!batch) {
      throw new NotFoundException('产品批次不存在');
    }
    const inspectionData = {
      batchId: createSafetyInspectionDto.batchId,
      creatorId: createSafetyInspectionDto.creatorId,
      riskFactorType: createSafetyInspectionDto.riskFactorType,
      inspectionTime: createSafetyInspectionDto.inspectionTime,
      manualResult: createSafetyInspectionDto.manualResult,
      componentAnalysis: createSafetyInspectionDto.componentAnalysis,
      result_image_url: createSafetyInspectionDto.resultImageUrl,
    } as Partial<SafetyInspection>;
    const inspection = this.safetyInspectionsRepository.create(inspectionData);
    return this.safetyInspectionsRepository.save(inspection);
  }

  findAll(): Promise<SafetyInspection[]> {
    return this.safetyInspectionsRepository.find();
  }

  findOne(id: number): Promise<SafetyInspection> {
    return this.safetyInspectionsRepository.findOne({ where: { id } });
  }

  findByBatch(batchId: number): Promise<SafetyInspection[]> {
    return this.safetyInspectionsRepository.find({
      where: { batchId },
    });
  }

  async update(id: number, dto: UpdateSafetyInspectionDto, user: { id: number; role: string }): Promise<SafetyInspection> {
    const entity = await this.safetyInspectionsRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('安全检测记录不存在');
    if (user?.role === 'producer' && entity.creatorId !== user.id) {
      throw new ForbiddenException('无权修改他人的安全检测记录');
    }
    // 如果上传了新检测图片，删除旧图片
    if (dto.resultImageUrl && entity.result_image_url && dto.resultImageUrl !== entity.result_image_url) {
      const oldPath = join(process.cwd(), entity.result_image_url.replace(/^\//, ''));
      try { await fs.unlink(oldPath); } catch {}
    }
    // 合并更新字段；注意 resultImageUrl -> result_image_url 的命名映射
    const { resultImageUrl, ...rest } = dto as any;
    const merged = this.safetyInspectionsRepository.merge(entity, rest as Partial<SafetyInspection>);
    if (resultImageUrl) {
      (merged as any).result_image_url = resultImageUrl;
    }
    return this.safetyInspectionsRepository.save(merged);
  }

  async remove(id: number, user: { id: number; role: string }): Promise<void> {
    const entity = await this.safetyInspectionsRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('安全检测记录不存在');
    if (user?.role === 'producer' && entity.creatorId !== user.id) {
      throw new ForbiddenException('无权删除他人的安全检测记录');
    }
    if (entity.result_image_url) {
      const imgPath = join(process.cwd(), entity.result_image_url.replace(/^\//, ''));
      try { await fs.unlink(imgPath); } catch {}
    }
    await this.safetyInspectionsRepository.delete(id);
  }
}
