import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';

import { Product } from './entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Batch } from '../batches/entities/batch.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<{ product: Product; batch: Batch }> {
    const { 
      name, 
      batchCode, 
      producerId, 
      origin, 
      plantingDate, 
      harvestDate, 
      testType, 
      testDate, 
      testReport, 
      isQualified, 
      batchNotes,
      safetyRiskTest,
      ingredientTest,
      createdBy,
      ...otherFields 
    } = createProductDto;

    // 验证必填字段
    if (!name || name.trim() === '') {
      throw new BadRequestException('产品名称不能为空');
    }

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

    // 获取生产者信息
    const producer = await this.userRepository.findOne({
      where: { id: producerId },
      relations: ['enterprise'],
    });

    if (!producer) {
      throw new NotFoundException('生产者不存在');
    }

    // 创建产品并填充生产者快照字段
    const product = this.productRepository.create({
      name,
      producerId,
      origin,
      plantingDate,
      harvestDate,
      testType,
      testDate,
      testReport,
      isQualified,
      safetyRiskTest,
      ingredientTest,
      createdBy,
      ...otherFields,
      producerName: producer.username,
      producerTel: producer.tel,
      producerEnterprise: producer.enterprise?.name || null,
    });

    const savedProduct = await this.productRepository.save(product);

    // 创建批次
    const batch = this.batchRepository.create({
      batchCode,
      productId: savedProduct.id,
      notes: batchNotes,
    });

    const savedBatch = await this.batchRepository.save(batch);

    return {
      product: savedProduct,
      batch: savedBatch,
    };
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['producer', 'batches', 'qrcodes'],
    });
  }

  async findOne(id: number): Promise<any> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['producer', 'batches', 'qrcodes'],
    });

    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    // 兼容前端结构，返回batch字段（取batches[0]或空对象）
    const batch = Array.isArray(product.batches) && product.batches.length > 0 ? product.batches[0] : { batchCode: '', createTime: '', notes: '' };
    return {
      ...product,
      batch,
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.findOne(id); // 检查产品是否存在
    await this.productRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async findByProducer(producerId: number): Promise<Product[]> {
    return this.productRepository.find({
      where: { producerId },
      relations: ['producer', 'batches', 'qrcodes'],
    });
  }

  async findByName(name: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { name },
      relations: ['producer', 'batches', 'qrcodes'],
    });
  }

  async findByOrigin(origin: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { origin },
      relations: ['producer', 'batches', 'qrcodes'],
    });
  }

  async findQualifiedProducts(): Promise<Product[]> {
    return this.productRepository.find({
      where: { isQualified: true },
      relations: ['producer', 'batches', 'qrcodes'],
    });
  }

  async getProductStats(): Promise<any> {
    const totalProducts = await this.productRepository.count();
    const qualifiedProducts = await this.productRepository.count({
      where: { isQualified: true },
    });
    const unqualifiedProducts = totalProducts - qualifiedProducts;

    return {
      total: totalProducts,
      qualified: qualifiedProducts,
      unqualified: unqualifiedProducts,
      qualificationRate: totalProducts > 0 ? (qualifiedProducts / totalProducts) * 100 : 0,
    };
  }

  // 管理员录入产品到指定农户
  async createByAdmin(createProductDto: CreateProductDto, adminId: number): Promise<{ product: Product; batch: Batch }> {
    // 验证管理员权限
    const admin = await this.userRepository.findOne({
      where: { id: adminId },
      relations: ['role'],
    });

    if (!admin || admin.role.name !== 'admin') {
      throw new BadRequestException('只有管理员可以执行此操作');
    }

    // 设置录入者ID
    createProductDto.createdBy = adminId;

    return this.create(createProductDto);
  }

  // 获取农户检测结果用于导出
  async getFarmerTestResults(farmerId?: number): Promise<any[]> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.producer', 'producer')
      .leftJoinAndSelect('product.batches', 'batches')
      .leftJoinAndSelect('producer.enterprise', 'enterprise');

    if (farmerId) {
      queryBuilder.where('product.producerId = :farmerId', { farmerId });
    }

    const products = await queryBuilder.getMany();

    return products.map(product => ({
      产品名称: product.name,
      生产者: product.producerName,
      联系电话: product.producerTel,
      所属企业: product.producerEnterprise,
      产地: product.origin,
      种植日期: product.plantingDate,
      采收日期: product.harvestDate,
      检测类型: product.testType,
      检测日期: product.testDate,
      是否合格: product.isQualified ? '是' : '否',
      安全风险因子检测: product.safetyRiskTest,
      产品成分检测: product.ingredientTest,
      批次编号: product.batches?.[0]?.batchCode,
      创建时间: product.created_at,
    }));
  }

  // 导出农户检测结果
  async exportFarmerTestResults(res: Response, farmerId?: number): Promise<void> {
    const results = await this.getFarmerTestResults(farmerId);
    
    // 生成CSV内容
    const headers = [
      '产品名称', '生产者', '联系电话', '所属企业', '产地', 
      '种植日期', '采收日期', '检测类型', '检测日期', 
      '是否合格', '安全风险因子检测', '产品成分检测', '批次编号', '创建时间'
    ];

    const csvContent = [
      headers.join(','),
      ...results.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');

    // 设置响应头
    const filename = farmerId ? `farmer_${farmerId}_test_results.csv` : 'all_farmers_test_results.csv';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(csvContent);
  }
} 