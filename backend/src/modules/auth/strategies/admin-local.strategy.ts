import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AdminLocalStrategy extends PassportStrategy(Strategy, 'admin-local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'username', passwordField: 'password' });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateAdmin(username, password);
    if (!user) {
      throw new UnauthorizedException('管理员用户名或密码错误');
    }
    return user;
  }
}
