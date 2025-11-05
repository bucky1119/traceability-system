import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminsService } from '../admins/admins.service';
import { ProducersService } from '../producers/producers.service';
import * as bcrypt from 'bcryptjs';
import { Admin } from '../admins/entities/admin.entity';
import { Producer } from '../producers/entities/producer.entity';

@Injectable()
export class AuthService {
  constructor(
    private adminsService: AdminsService,
    private producersService: ProducersService,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(username: string, pass: string): Promise<Omit<Admin, 'passwordHash'> | null> {
    const admin = await this.adminsService.findOne(username);
    if (admin && await bcrypt.compare(pass, admin.passwordHash)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = admin;
      return result;
    }
    return null;
  }

  async validateProducer(login: string, pass: string): Promise<Omit<Producer, 'password_hash'> | null> {
    const producer = await this.producersService.findOneByLogin(login);
    if (producer && await bcrypt.compare(pass, producer.password_hash)) {
      const { password_hash, ...result } = producer;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, role: user.role };
    if (user.username) {
      payload['username'] = user.username;
    }
    if (user.name) {
      payload['name'] = user.name;
    }
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
