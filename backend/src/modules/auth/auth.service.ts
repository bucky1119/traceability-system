import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '../users/entities/user.entity';
import { Enterprise } from '../enterprises/entities/enterprise.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Enterprise)
    private readonly enterpriseRepository: Repository<Enterprise>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['role', 'enterprise'],
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = { username: user.username, sub: user.id, role: user.role.type };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role.type, // 返回字符串类型
        enterprise: user.enterprise,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { username, password, tel, roleId, enterpriseId, enterpriseName } = registerDto;

    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 处理企业选择逻辑
    let finalEnterpriseId = enterpriseId;
    
    // 如果选择了"其他"企业（enterpriseId为null且有enterpriseName）
    if (!enterpriseId && enterpriseName) {
      // 检查企业名称是否已存在
      const existingEnterprise = await this.enterpriseRepository.findOne({
        where: { name: enterpriseName },
      });

      if (existingEnterprise) {
        // 如果企业已存在，使用现有企业ID
        finalEnterpriseId = existingEnterprise.id;
      } else {
        // 创建新企业
        const newEnterprise = this.enterpriseRepository.create({
          name: enterpriseName,
          contacts: '待完善',
          tel: '待完善',
          license: '待完善',
          address: '待完善',
        });
        
        const savedEnterprise = await this.enterpriseRepository.save(newEnterprise);
        finalEnterpriseId = savedEnterprise.id;
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户，使用传递的roleId或默认为生产者角色（roleId = 2）
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      tel,
      roleId: roleId || 2, // 使用传递的roleId或默认为生产者角色
      enterpriseId: finalEnterpriseId,
    });

    const savedUser = await this.userRepository.save(user);
    const { password: _, ...result } = savedUser;

    return result;
  }

  async getCurrentUser(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'enterprise'],
    });

    if (!user) {
      throw new ConflictException('用户不存在');
    }

    const { password, ...result } = user;
    return result;
  }
} 