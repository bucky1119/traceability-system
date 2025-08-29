import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('产品管理')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 公共接口 - 无需认证
  @Get('public')
  @ApiOperation({ summary: '获取公开产品列表（无需登录）' })
  @ApiResponse({ status: 200, description: '获取产品列表成功' })
  getPublicProducts(@Query('name') name?: string, @Query('origin') origin?: string) {
    if (name) {
      return this.productsService.findByName(name);
    }
    if (origin) {
      return this.productsService.findByOrigin(origin);
    }
    return this.productsService.findAll();
  }

  @Get('qualified')
  @ApiOperation({ summary: '获取合格产品列表（无需登录）' })
  @ApiResponse({ status: 200, description: '获取合格产品列表成功' })
  findQualifiedProducts() {
    return this.productsService.findQualifiedProducts();
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的产品列表' })
  @ApiResponse({ status: 200, description: '获取我的产品列表成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findMyProducts(@Request() req) {
    const userId = Number(req.user.id);
    // console.log('当前用户ID:', userId);
    return this.productsService.findByProducer(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取产品统计信息' })
  @ApiResponse({ status: 200, description: '获取产品统计信息成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProductStats() {
    return this.productsService.getProductStats();
  }

  @Get('export')
  @ApiOperation({ summary: '导出农户检测结果' })
  @ApiResponse({ status: 200, description: '导出成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async exportTestResults(@Query('farmerId') farmerId?: string, @Res() res?: Response) {
    const farmerIdNum = farmerId ? +farmerId : undefined;
    await this.productsService.exportFarmerTestResults(res, farmerIdNum);
  }

  // 需要认证的接口
  @Post()
  @ApiOperation({ summary: '创建产品（包含批次信息）' })
  @ApiResponse({ status: 201, description: '产品和批次创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post('admin')
  @ApiOperation({ summary: '管理员录入产品到指定农户' })
  @ApiResponse({ status: 201, description: '管理员录入产品成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createByAdmin(@Body() createProductDto: CreateProductDto, @Request() req) {
    const adminId = req.user.id;
    return this.productsService.createByAdmin(createProductDto, adminId);
  }

  @Get()
  @ApiOperation({ summary: '获取产品列表（需要登录）' })
  @ApiResponse({ status: 200, description: '获取产品列表成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Query('producerId') producerId?: string, @Query('name') name?: string, @Query('origin') origin?: string) {
    if (producerId) {
      return this.productsService.findByProducer(+producerId);
    }
    if (name) {
      return this.productsService.findByName(name);
    }
    if (origin) {
      return this.productsService.findByOrigin(origin);
    }
    return this.productsService.findAll();
  }

  

  @Get(':id')
  @ApiOperation({ summary: '获取产品详情（无需登录）' })
  @ApiResponse({ status: 200, description: '获取产品详情成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  findOne(@Param('id') id: string) {
    const numId = Number(id);
    if (!numId || isNaN(numId) || numId <= 0) {
      throw new BadRequestException('产品ID无效');
    }
    return this.productsService.findOne(numId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新产品信息' })
  @ApiResponse({ status: 200, description: '产品信息更新成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除产品' })
  @ApiResponse({ status: 200, description: '产品删除成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
} 