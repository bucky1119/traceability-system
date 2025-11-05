import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admins')
@UseGuards(JwtAuthGuard, RolesGuard) // Secure all admin routes
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @Roles('admin') // Only users with 'admin' role can create new admins
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.adminsService.findAll();
  }
}
