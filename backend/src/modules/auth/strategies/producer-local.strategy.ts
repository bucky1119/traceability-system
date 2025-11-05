import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class ProducerLocalStrategy extends PassportStrategy(Strategy, 'producer-local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'account', // Use 'account' for login
      passwordField: 'password',
    });
  }

  async validate(account: string, pass: string): Promise<any> {
    const producer = await this.authService.validateProducer(account, pass);
    if (!producer) {
      throw new UnauthorizedException('生产者登录凭证无效');
    }
    return producer;
  }
}
