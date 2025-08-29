import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Enterprise } from './entities/enterprise.entity';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';

@Injectable()
export class EnterprisesService {
  constructor(
    @InjectRepository(Enterprise)
    private readonly enterpriseRepository: Repository<Enterprise>,
  ) {}

  async create(createEnterpriseDto: CreateEnterpriseDto): Promise<Enterprise> {
    const { name, license } = createEnterpriseDto;

    // 检查企业名称是否已存在
    const existingByName = await this.enterpriseRepository.findOne({
      where: { name },
    });

    if (existingByName) {
      throw new ConflictException('企业名称已存在');
    }

    // 检查营业执照号是否已存在
    const existingByLicense = await this.enterpriseRepository.findOne({
      where: { license },
    });

    if (existingByLicense) {
      throw new ConflictException('营业执照号已存在');
    }

    const enterprise = this.enterpriseRepository.create(createEnterpriseDto);
    return this.enterpriseRepository.save(enterprise);
  }

  async createEnterpriseFromName(name: string): Promise<Enterprise> {
    // 检查企业名称是否已存在
    const existingEnterprise = await this.enterpriseRepository.findOne({
      where: { name },
    });

    if (existingEnterprise) {
      return existingEnterprise;
    }

    // 创建新企业，其他字段设为默认值
    const newEnterprise = this.enterpriseRepository.create({
      name,
      contacts: '待完善',
      tel: '待完善',
      license: '待完善',
      address: '待完善',
    });

    return this.enterpriseRepository.save(newEnterprise);
  }

  async findAll(): Promise<Enterprise[]> {
    return this.enterpriseRepository.find({
      relations: ['users'],
    });
  }

  async findOne(id: number): Promise<Enterprise> {
    const enterprise = await this.enterpriseRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!enterprise) {
      throw new NotFoundException('企业不存在');
    }

    return enterprise;
  }

  async update(id: number, updateEnterpriseDto: UpdateEnterpriseDto): Promise<Enterprise> {
    const enterprise = await this.findOne(id);

    // 如果要更新企业名称，检查是否已存在
    if (updateEnterpriseDto.name && updateEnterpriseDto.name !== enterprise.name) {
      const existingByName = await this.enterpriseRepository.findOne({
        where: { name: updateEnterpriseDto.name },
      });

      if (existingByName) {
        throw new ConflictException('企业名称已存在');
      }
    }

    // 如果要更新营业执照号，检查是否已存在
    if (updateEnterpriseDto.license && updateEnterpriseDto.license !== enterprise.license) {
      const existingByLicense = await this.enterpriseRepository.findOne({
        where: { license: updateEnterpriseDto.license },
      });

      if (existingByLicense) {
        throw new ConflictException('营业执照号已存在');
      }
    }

    await this.enterpriseRepository.update(id, updateEnterpriseDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const enterprise = await this.findOne(id);
    await this.enterpriseRepository.remove(enterprise);
  }

  async findByLicense(license: string): Promise<Enterprise> {
    return this.enterpriseRepository.findOne({
      where: { license },
      relations: ['users'],
    });
  }

  async findByName(name: string): Promise<Enterprise> {
    return this.enterpriseRepository.findOne({
      where: { name },
      relations: ['users'],
    });
  }
} 