import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminsRepository: Repository<Admin>,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<Omit<Admin, 'passwordHash'>> {
    const { username, password, role } = createAdminDto;

    const existingAdmin = await this.adminsRepository.findOne({ where: { username } });
    if (existingAdmin) {
      throw new ConflictException('用户名已存在');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = this.adminsRepository.create({
      username,
      passwordHash,
      role: role || 'inspector',
    });

    const savedAdmin = await this.adminsRepository.save(admin);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = savedAdmin;
    return result;
  }

  async findOne(username: string): Promise<Admin | undefined> {
    return this.adminsRepository.findOne({ where: { username } });
  }

  findAll(): Promise<Admin[]> {
    return this.adminsRepository.find({
        select: ['id', 'username', 'role', 'createdAt'],
    });
  }
}
