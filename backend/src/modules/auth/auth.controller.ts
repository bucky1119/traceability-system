import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('admin-local'))
  @Post('admin/login')
  async adminLogin(@Request() req, @Body() _dto: AdminLoginDto) {
    // loginDto is captured to satisfy swagger, req.user is from AdminLocalStrategy
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('producer-local'))
  @Post('producer/login')
  async producerLogin(@Request() req, @Body() loginDto: LoginDto) {
    // loginDto is captured to satisfy swagger, req.user is from ProducerLocalStrategy
    return this.authService.login(req.user);
  }
}
