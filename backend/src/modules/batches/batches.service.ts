import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Batch } from './entities/batch.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
  ) {}

  async create(createBatchDto: CreateBatchDto): Promise<Batch> {
    const { batchCode, productId } = createBatchDto;

    // 验证必填字段
    if (!batchCode || batchCode.trim() === '') {
      throw new BadRequestException('批次编号不能为空');
    }

    // 检查批次编号是否已存在
    const existingBatch = await this.batchRepository.findOne({
      where: { batchCode },
    });

    if (existingBatch) {
      throw new BadRequestException('批次编号已存在');
    }

    const batch = this.batchRepository.create(createBatchDto);
    return this.batchRepository.save(batch);
  }

  async findAll(): Promise<Batch[]> {
    return this.batchRepository.find({
      relations: ['product', 'environments', 'actions', 'qrcodes'],
    });
  }

  async findOne(id: number): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { id },
      relations: ['product', 'environments', 'actions', 'qrcodes'],
    });

    if (!batch) {
      throw new NotFoundException('批次不存在');
    }

    return batch;
  }

  async update(id: number, updateBatchDto: UpdateBatchDto): Promise<Batch> {
    await this.findOne(id);
    await this.batchRepository.update(id, updateBatchDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const batch = await this.findOne(id);
    await this.batchRepository.remove(batch);
  }

  async findByProduct(productId: number): Promise<Batch[]> {
    return this.batchRepository.find({
      where: { productId },
      relations: ['product', 'environments', 'actions', 'qrcodes'],
    });
  }

  async findByBatchCode(batchCode: string): Promise<Batch> {
    return this.batchRepository.findOne({
      where: { batchCode },
      relations: ['product', 'environments', 'actions', 'qrcodes'],
    });
  }

  async getBatchStats(): Promise<any> {
    const totalBatches = await this.batchRepository.count();
    const batchesWithQrcodes = await this.batchRepository
      .createQueryBuilder('batch')
      .leftJoin('batch.qrcodes', 'qrcode')
      .where('qrcode.id IS NOT NULL')
      .getCount();

    return {
      total: totalBatches,
      withQrcodes: batchesWithQrcodes,
      withoutQrcodes: totalBatches - batchesWithQrcodes,
    };
  }
} 