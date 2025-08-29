import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminService } from './admin.service';
import { CreateFarmerProductDto } from './dto/create-farmer-product.dto';

@ApiTags('管理员功能')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('farmers')
  @ApiOperation({ summary: '获取农户列表' })
  @ApiResponse({ status: 200, description: '获取农户列表成功' })
  async getFarmers() {
    return this.adminService.getFarmers();
  }

  @Post('products')
  @ApiOperation({ summary: '为农户录入产品' })
  @ApiResponse({ status: 201, description: '产品录入成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createFarmerProduct(@Body() createFarmerProductDto: CreateFarmerProductDto) {
    return this.adminService.createFarmerProduct(createFarmerProductDto);
  }

  @Get('products/export')
  @ApiOperation({ summary: '导出产品信息' })
  @ApiResponse({ status: 200, description: '导出成功' })
  async exportProducts(
    @Query('farmerId') farmerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const farmerIdNum = farmerId ? +farmerId : undefined;
    await this.adminService.exportProducts(res, farmerIdNum, startDate, endDate);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取系统统计信息' })
  @ApiResponse({ status: 200, description: '获取统计信息成功' })
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('products/stats')
  @ApiOperation({ summary: '获取产品统计信息' })
  @ApiResponse({ status: 200, description: '获取产品统计成功' })
  async getProductStats() {
    return this.adminService.getProductStats();
  }

  @Get('farmers/:id/products')
  @ApiOperation({ summary: '获取指定农户的产品列表' })
  @ApiResponse({ status: 200, description: '获取产品列表成功' })
  async getFarmerProducts(@Param('id') id: string) {
    return this.adminService.getFarmerProducts(+id);
  }

  @Get('enterprises')
  @ApiOperation({ summary: '获取企业统计信息' })
  @ApiResponse({ status: 200, description: '获取企业统计成功' })
  async getEnterpriseStats() {
    return this.adminService.getEnterpriseStats();
  }

  @Get('qrcodes/stats')
  @ApiOperation({ summary: '获取二维码统计信息' })
  @ApiResponse({ status: 200, description: '获取二维码统计成功' })
  async getQrcodeStats() {
    return this.adminService.getQrcodeStats();
  }
} 