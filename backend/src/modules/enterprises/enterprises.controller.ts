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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { EnterprisesService } from './enterprises.service';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';

@ApiTags('企业管理')
@Controller('enterprises')
export class EnterprisesController {
  constructor(private readonly enterprisesService: EnterprisesService) {}

  // 公共接口 - 无需认证
  @Get('public')
  @ApiOperation({ summary: '获取企业列表（无需登录）' })
  @ApiResponse({ status: 200, description: '获取企业列表成功' })
  getPublicEnterprises() {
    return this.enterprisesService.findAll();
  }

  // 需要认证的接口
  @Post()
  @ApiOperation({ summary: '创建企业' })
  @ApiResponse({ status: 201, description: '企业创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '企业名称或营业执照号已存在' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createEnterpriseDto: CreateEnterpriseDto) {
    return this.enterprisesService.create(createEnterpriseDto);
  }

  @Get()
  @ApiOperation({ summary: '获取企业列表（需要登录）' })
  @ApiResponse({ status: 200, description: '获取企业列表成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll() {
    return this.enterprisesService.findAll();
  }

  @Get('search/license/:license')
  @ApiOperation({ summary: '根据营业执照号查询企业' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findByLicense(@Param('license') license: string) {
    return this.enterprisesService.findByLicense(license);
  }

  @Get('search/name/:name')
  @ApiOperation({ summary: '根据企业名称查询企业' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findByName(@Param('name') name: string) {
    return this.enterprisesService.findByName(name);
  }
  @Get(':id')
  @ApiOperation({ summary: '获取企业详情' })
  @ApiResponse({ status: 200, description: '获取企业详情成功' })
  @ApiResponse({ status: 404, description: '企业不存在' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.enterprisesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新企业信息' })
  @ApiResponse({ status: 200, description: '企业信息更新成功' })
  @ApiResponse({ status: 404, description: '企业不存在' })
  @ApiResponse({ status: 409, description: '企业名称或营业执照号已存在' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateEnterpriseDto: UpdateEnterpriseDto) {
    return this.enterprisesService.update(+id, updateEnterpriseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除企业' })
  @ApiResponse({ status: 200, description: '企业删除成功' })
  @ApiResponse({ status: 404, description: '企业不存在' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.enterprisesService.remove(+id);
  }
} 