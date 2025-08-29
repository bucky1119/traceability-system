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

import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

@ApiTags('批次管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Post()
  @ApiOperation({ summary: '创建批次' })
  @ApiResponse({ status: 201, description: '批次创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createBatchDto: CreateBatchDto) {
    return this.batchesService.create(createBatchDto);
  }

  @Get()
  @ApiOperation({ summary: '获取批次列表' })
  @ApiResponse({ status: 200, description: '获取批次列表成功' })
  findAll(@Query('productId') productId?: string) {
    if (productId) {
      return this.batchesService.findByProduct(+productId);
    }
    return this.batchesService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: '获取批次统计信息' })
  @ApiResponse({ status: 200, description: '获取批次统计信息成功' })
  getBatchStats() {
    return this.batchesService.getBatchStats();
  }

  @Get('code/:batchCode')
  @ApiOperation({ summary: '根据批次编号查询批次' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findByBatchCode(@Param('batchCode') batchCode: string) {
    return this.batchesService.findByBatchCode(batchCode);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取批次详情' })
  @ApiResponse({ status: 200, description: '获取批次详情成功' })
  @ApiResponse({ status: 404, description: '批次不存在' })
  findOne(@Param('id') id: string) {
    return this.batchesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新批次信息' })
  @ApiResponse({ status: 200, description: '批次信息更新成功' })
  @ApiResponse({ status: 404, description: '批次不存在' })
  update(@Param('id') id: string, @Body() updateBatchDto: UpdateBatchDto) {
    return this.batchesService.update(+id, updateBatchDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除批次' })
  @ApiResponse({ status: 200, description: '批次删除成功' })
  @ApiResponse({ status: 404, description: '批次不存在' })
  remove(@Param('id') id: string) {
    return this.batchesService.remove(+id);
  }
} 