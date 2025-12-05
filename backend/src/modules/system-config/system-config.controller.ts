import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { UpdateRegistrationCodeDto } from './dto/update-registration-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('system-config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Put('registration-code')
  @Roles('admin')
  async setRegistrationCode(@Body() updateDto: UpdateRegistrationCodeDto) {
    await this.systemConfigService.setRegistrationCode(updateDto.code);
    return { message: '注册码更新成功' };
  }

  @Get('registration-code')
  @Roles('admin')
  async getRegistrationCode() {
    const code = await this.systemConfigService.getRegistrationCode();
    return { registrationCode: code };
  }
}
