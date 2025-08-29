import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, tel, roleId, enterpriseId } = createUserDto;

    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      tel,
      roleId,
      enterpriseId,
    });

    const savedUser = await this.userRepository.save(user);
    const { password: _, ...result } = savedUser;

    return result as User;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['role', 'enterprise'],
      select: ['id', 'username', 'tel', 'createTime', 'created_at', 'updated_at'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'enterprise'],
      select: ['id', 'username', 'tel', 'createTime', 'created_at', 'updated_at'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['role', 'enterprise'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // 如果要更新用户名，检查是否已存在
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }
    }

    // 如果要更新密码，需要加密
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async findByRole(roleId: number): Promise<User[]> {
    return this.userRepository.find({
      where: { roleId },
      relations: ['role', 'enterprise'],
      select: ['id', 'username', 'tel', 'createTime', 'created_at', 'updated_at'],
    });
  }

  async findByEnterprise(enterpriseId: number): Promise<User[]> {
    return this.userRepository.find({
      where: { enterpriseId },
      relations: ['role', 'enterprise'],
      select: ['id', 'username', 'tel', 'createTime', 'created_at', 'updated_at'],
    });
  }
} 