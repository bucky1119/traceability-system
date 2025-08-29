import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Enterprise } from '../enterprises/entities/enterprise.entity';
import { Qrcode } from '../qrcodes/entities/qrcode.entity';
import { Role, RoleType } from '../roles/entities/role.entity';
import { CreateFarmerProductDto } from './dto/create-farmer-product.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Enterprise)
    private readonly enterpriseRepository: Repository<Enterprise>,
    @InjectRepository(Qrcode)
    private readonly qrcodeRepository: Repository<Qrcode>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async getFarmers() {
    const producerRole = await this.roleRepository.findOne({
      where: { type: RoleType.PRODUCER },
    });

    if (!producerRole) {
      throw new NotFoundException('生产者角色不存在');
    }

    const farmers = await this.userRepository.find({
      where: { roleId: producerRole.id },
      relations: ['enterprise'],
      select: ['id', 'username', 'tel', 'created_at'],
    });

    // 为每个农户添加产品数量统计
    const farmersWithStats = await Promise.all(
      farmers.map(async (farmer) => {
        const productCount = await this.productRepository.count({
          where: { producerId: farmer.id },
        });

        return {
          id: farmer.id,
          username: farmer.username,
          tel: farmer.tel,
          enterprise: farmer.enterprise?.name || '未分配企业',
          productCount,
          createdAt: farmer.created_at,
        };
      }),
    );

    return farmersWithStats;
  }

  async createFarmerProduct(createFarmerProductDto: CreateFarmerProductDto) {
    const { farmerId, ...productData } = createFarmerProductDto;

    // 验证农户是否存在
    const farmer = await this.userRepository.findOne({
      where: { id: farmerId },
      relations: ['role'],
    });

    if (!farmer) {
      throw new NotFoundException('农户不存在');
    }

    // 验证农户是否为生产者
    if (farmer.role.type !== RoleType.PRODUCER) {
      throw new BadRequestException('只能为生产者录入产品');
    }

    // 创建产品
    const product = this.productRepository.create({
      ...productData,
      producerId: farmerId,
      producerName: farmer.username,
      producerTel: farmer.tel,
      producerEnterprise: farmer.enterprise?.name || '',
    });

    const savedProduct = await this.productRepository.save(product);

    return {
      success: true,
      data: {
        product: {
          id: savedProduct.id,
        },
      },
    };
  }

  async exportProducts(
    res: Response,
    farmerId?: number,
    startDate?: string,
    endDate?: string,
  ) {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.producer', 'producer')
      .leftJoinAndSelect('product.batches', 'batches')
      .leftJoinAndSelect('producer.enterprise', 'enterprise');

    if (farmerId) {
      queryBuilder.where('product.producerId = :farmerId', { farmerId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('product.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const products = await queryBuilder.getMany();

    // 创建CSV格式的响应
    const csvData = [
      ['产品ID', '产品名称', '生产者', '企业', '产地', '批次编号', '检测结果', '检测类型', '检测日期', '录入时间'].join(','),
      ...products.map((product) => {
        const batchCode = product.batches?.[0]?.batchCode || '';
        return [
          product.id,
          product.name,
          product.producer?.username || '',
          product.producer?.enterprise?.name || '',
          product.origin || '',
          batchCode,
          product.isQualified ? '合格' : '不合格',
          product.testType || '',
          product.testDate ? new Date(product.testDate).toLocaleDateString() : '',
          new Date(product.created_at).toLocaleString(),
        ].join(',');
      }),
    ].join('\n');

    // 设置响应头
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=products_${new Date().toISOString().split('T')[0]}.csv`,
    );

    // 写入响应
    res.send(csvData);
  }

  async getSystemStats() {
    const [
      totalUsers,
      totalProducts,
      totalQrcodes,
      totalEnterprises,
      qualifiedProducts,
      unqualifiedProducts,
    ] = await Promise.all([
      this.userRepository.count(),
      this.productRepository.count(),
      this.qrcodeRepository.count(),
      this.enterpriseRepository.count(),
      this.productRepository.count({ where: { isQualified: true } }),
      this.productRepository.count({ where: { isQualified: false } }),
    ]);

    // 获取扫码总数
    const qrcodes = await this.qrcodeRepository.find({
      select: ['scanCount'],
    });
    const totalScans = qrcodes.reduce((sum, qrcode) => sum + qrcode.scanCount, 0);

    return {
      totalUsers,
      totalProducts,
      totalQrcodes,
      totalEnterprises,
      qualifiedProducts,
      unqualifiedProducts,
      totalScans,
    };
  }

  async getProductStats() {
    const stats = await this.productRepository
      .createQueryBuilder('product')
      .select([
        'COUNT(*) as total',
        'SUM(CASE WHEN product.isQualified = true THEN 1 ELSE 0 END) as qualified',
        'SUM(CASE WHEN product.isQualified = false THEN 1 ELSE 0 END) as unqualified',
      ])
      .getRawOne();

    return {
      total: parseInt(stats.total),
      qualified: parseInt(stats.qualified),
      unqualified: parseInt(stats.unqualified),
      qualifiedRate: stats.total > 0 ? (parseInt(stats.qualified) / parseInt(stats.total) * 100).toFixed(2) : '0',
    };
  }

  async getFarmerProducts(farmerId: number) {
    const products = await this.productRepository.find({
      where: { producerId: farmerId },
      relations: ['batches'],
      order: { created_at: 'DESC' },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      origin: product.origin,
      isQualified: product.isQualified,
      batchCode: product.batches?.[0]?.batchCode || '',
      createdAt: product.created_at,
    }));
  }

  async getEnterpriseStats() {
    const enterprises = await this.enterpriseRepository
      .createQueryBuilder('enterprise')
      .leftJoin('enterprise.users', 'users')
      .leftJoin('users.products', 'products')
      .select([
        'enterprise.id',
        'enterprise.name',
        'COUNT(DISTINCT users.id) as userCount',
        'COUNT(products.id) as productCount',
      ])
      .groupBy('enterprise.id')
      .getRawMany();

    return enterprises.map((enterprise) => ({
      id: enterprise.enterprise_id,
      name: enterprise.enterprise_name,
      userCount: parseInt(enterprise.userCount),
      productCount: parseInt(enterprise.productCount),
    }));
  }

  async getQrcodeStats() {
    const stats = await this.qrcodeRepository
      .createQueryBuilder('qrcode')
      .select([
        'COUNT(*) as total',
        'SUM(qrcode.scanCount) as totalScans',
        'AVG(qrcode.scanCount) as avgScans',
      ])
      .getRawOne();

    return {
      total: parseInt(stats.total),
      totalScans: parseInt(stats.totalScans),
      avgScans: parseFloat(stats.avgScans).toFixed(2),
    };
  }
} 