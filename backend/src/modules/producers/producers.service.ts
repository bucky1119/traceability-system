import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producer } from './entities/producer.entity';
import { CreateProducerDto } from './dto/create-producer.dto';
import * as bcrypt from 'bcryptjs';
import { SystemConfigService } from '../system-config/system-config.service';
import { UpdateProducerDto } from './dto/update-producer.dto';

@Injectable()
export class ProducersService {
  constructor(
    @InjectRepository(Producer)
    private producersRepository: Repository<Producer>,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async create(createProducerDto: CreateProducerDto): Promise<Omit<Producer, 'password_hash'>> {
    const { account, name, phone, password, registrationCode } = createProducerDto;

    // 0. 验证注册码
    const correctCode = await this.systemConfigService.getRegistrationCode();
    if (!correctCode || registrationCode !== correctCode) {
      throw new UnauthorizedException('注册码无效或不正确');
    }

    // 1. 检查 account 是否已存在
    const existingProducer = await this.producersRepository.findOne({
      where: { account },
    });
    if (existingProducer) {
      throw new ConflictException('登录账号已被注册');
    }

    // 2. 哈希密码
    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(password, salt);

    // 3. 创建新生产者实例
    const newProducer = this.producersRepository.create({
      account,
      name,
      phone,
      password_hash,
    });

    // 4. 保存到数据库
    const savedProducer = await this.producersRepository.save(newProducer);
    
    // 5. 返回不含密码哈希的用户信息
    const { password_hash: _, ...result } = savedProducer;
    return result;
  }

  async findOneByLogin(login: string): Promise<Producer | undefined> {
    return this.producersRepository.findOne({
      where: { account: login },
    });
  }

  async findOne(id: number): Promise<Producer> {
    return this.producersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<Producer[]> {
    return this.producersRepository.find();
  }

  async updateSelf(userId: number, dto: UpdateProducerDto): Promise<Omit<Producer, 'password_hash'>> {
    const producer = await this.producersRepository.findOne({ where: { id: userId } });
    if (!producer) throw new NotFoundException('用户不存在');

    if (dto.name !== undefined) producer.name = dto.name;
    if (dto.phone !== undefined) producer.phone = dto.phone;

    const saved = await this.producersRepository.save(producer);
    const { password_hash: _omit, ...result } = saved as any;
    return result;
  }
}
