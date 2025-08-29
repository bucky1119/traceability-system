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
  Header,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { QrcodesService } from './qrcodes.service';
import { CreateQrcodeDto } from './dto/create-qrcode.dto';
import { UpdateQrcodeDto } from './dto/update-qrcode.dto';
import { DecodeQrcodeDto } from './dto/decode-qrcode.dto';

@ApiTags('二维码管理')
@Controller('qrcodes')
export class QrcodesController {
  constructor(private readonly qrcodesService: QrcodesService) {}

  @Post()
  @ApiOperation({ summary: '创建二维码' })
  @ApiResponse({ status: 201, description: '二维码创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createQrcodeDto: CreateQrcodeDto) {
    return this.qrcodesService.create(createQrcodeDto);
  }

  @Post('batch/:batchId/:count')
  @ApiOperation({ summary: '批量生成二维码' })
  @ApiResponse({ status: 201, description: '批量生成二维码成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  batchGenerate(@Param('batchId') batchId: string, @Param('count') count: string) {
    return this.qrcodesService.batchGenerate(+batchId, +count);
  }

  @Get()
  @ApiOperation({ summary: '获取二维码列表' })
  @ApiResponse({ status: 200, description: '获取二维码列表成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Query('batchId') batchId?: string, @Query('productId') productId?: string) {
    if (batchId) {
      return this.qrcodesService.findByBatch(+batchId);
    }
    if (productId) {
      return this.qrcodesService.findByProduct(+productId);
    }
    return this.qrcodesService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: '获取二维码统计信息' })
  @ApiResponse({ status: 200, description: '获取二维码统计信息成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getQrcodeStats() {
    return this.qrcodesService.getQrcodeStats();
  }

  @Get('scan/:qrcodeId')
  @ApiOperation({ summary: '扫描二维码' })
  @ApiResponse({ status: 200, description: '扫描成功' })
  @ApiResponse({ status: 404, description: '二维码不存在' })
  async scanQrcode(@Param('qrcodeId') qrcodeId: string) {
    await this.qrcodesService.incrementScanCount(qrcodeId);
    return this.qrcodesService.findByQrcodeId(qrcodeId);
  }

  @Get('trace/:qrcodeId')
  @ApiOperation({ summary: '查询产品溯源信息（公共接口）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '二维码不存在' })
  async getTraceInfo(@Param('qrcodeId') qrcodeId: string) {
    const qrcode = await this.qrcodesService.findByQrcodeId(qrcodeId);
    // 增加扫描次数
    await this.qrcodesService.incrementScanCount(qrcodeId);

    const product = qrcode.product;
    const producer = product?.producer;

    return {
      qrcode: {
        id: qrcode.id,
        qrcodeId: qrcode.qrcodeId,
        generateTime: qrcode.generateTime,
        scanCount: qrcode.scanCount + 1, // 包含本次扫描
        status: qrcode.status,
      },
      product: {
        id: product?.id,
        name: product?.name,
        origin: product?.origin,
        plantingDate: product?.plantingDate,
        harvestDate: product?.harvestDate,
        testType: product?.testType,
        testDate: product?.testDate,
        isQualified: product?.isQualified,
        imageUrl: product?.imageUrl,
        producer: {
          id: producer?.id,
          username: product?.producerName || producer?.username,
          tel: product?.producerTel || producer?.tel,
          enterprise: product?.producerEnterprise || producer?.enterprise?.name,
        },
      },
      batch: qrcode.batch,
      // 可根据需要继续添加更多溯源信息
    };
  }

  @Post('decode')
  @ApiOperation({ summary: '解析二维码溯源信息（公共接口）' })
  @ApiResponse({ status: 200, description: '解析成功' })
  @ApiResponse({ status: 400, description: '二维码数据格式错误' })
  async decodeQrcodeData(@Body() decodeQrcodeDto: DecodeQrcodeDto) {
    try {
      const traceabilityData = JSON.parse(decodeQrcodeDto.qrcodeData);
      
      // 验证数据结构
      if (!traceabilityData.qrcodeId || !traceabilityData.product || !traceabilityData.batch) {
        throw new Error('二维码数据格式不正确');
      }
      
      // 增加扫描次数（如果二维码ID存在）
      try {
        await this.qrcodesService.incrementScanCount(traceabilityData.qrcodeId);
      } catch (error) {
        // 如果二维码不存在，仍然返回解析的数据
        console.warn('二维码ID不存在，无法更新扫描次数:', traceabilityData.qrcodeId);
      }
      
      return {
        success: true,
        data: traceabilityData,
        message: '二维码解析成功'
      };
    } catch (error) {
      throw new BadRequestException('二维码数据格式错误或无法解析');
    }
  }
  // 新增：获取二维码图片
  @Get('image/:qrcodeId')
  @ApiOperation({ summary: '获取二维码图片' })
  async getQrcodeImage(@Param('qrcodeId') qrcodeId: string, @Res() res: Response) {
    const qrcodeBuffer = await this.qrcodesService.getQrcodeImageFile(qrcodeId);
    console.log('进入 getQrcodeImage:', qrcodeId);
    if (!qrcodeBuffer) {
      return res.status(404).send('二维码不存在');
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 缓存1小时
    res.send(qrcodeBuffer);
  }

  // @Get('img/:qrcodeId')   // 换成 img 而不是 image
  // async getQrcodeImage(@Param('qrcodeId') qrcodeId: string, @Res() res: Response) {
  //   console.log('进入 getQrcodeImage:', qrcodeId);
  //   const qrcodeBuffer = await this.qrcodesService.getQrcodeImageFile(qrcodeId);
  //   res.setHeader('Content-Type', 'image/png');
  //   res.end(qrcodeBuffer);
  // }

  // 新增：获取二维码图片信息
  @Get('image-info/:qrcodeId')
  @ApiOperation({ summary: '获取二维码图片信息' })
  @ApiResponse({ status: 200, description: '获取二维码图片信息成功' })
  @ApiResponse({ status: 404, description: '二维码不存在' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getQrcodeImageInfo(@Param('qrcodeId') qrcodeId: string) {
    return this.qrcodesService.getQrcodeImageInfo(qrcodeId);
  }

  

  @Get('download/:qrcodeId')
  @ApiOperation({ summary: '下载二维码图片' })
  @ApiResponse({ status: 200, description: '下载二维码图片成功' })
  @ApiResponse({ status: 404, description: '二维码不存在' })
  @Header('Content-Type', 'image/png')
  @Header('Content-Disposition', 'attachment; filename="qrcode.png"')
  async downloadQrcodeImage(@Param('qrcodeId') qrcodeId: string, @Res() res: Response) {
    try {
      const qrcode = await this.qrcodesService.findByQrcodeId(qrcodeId);
      
      // 获取二维码图片文件
      const qrcodeBuffer = await this.qrcodesService.getQrcodeImageFile(qrcodeId);
      
      // 设置文件名
      const filename = `qrcode_${qrcodeId}.png`;
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', qrcodeBuffer.length);
      res.setHeader('Access-Control-Allow-Origin', '*'); // 允许跨域访问
      
      res.send(qrcodeBuffer);
    } catch (error) {
      console.error('下载二维码失败:', error);
      res.status(404).send('二维码不存在');
    }
  }

  @Get('preview/:qrcodeId')
  @ApiOperation({ summary: '预览二维码图片' })
  @ApiResponse({ status: 200, description: '预览二维码图片成功' })
  @ApiResponse({ status: 404, description: '二维码不存在' })
  @Header('Content-Type', 'image/png')
  async previewQrcodeImage(@Param('qrcodeId') qrcodeId: string, @Res() res: Response) {
    try {
      // 获取二维码图片文件
      const qrcodeBuffer = await this.qrcodesService.getQrcodeImageFile(qrcodeId);
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', qrcodeBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 缓存1小时
      res.setHeader('Access-Control-Allow-Origin', '*'); // 允许跨域访问
      
      res.send(qrcodeBuffer);
    } catch (error) {
      console.error('预览二维码失败:', error);
      res.status(404).send('二维码不存在');
    }
  }

  @Get('id/:qrcodeId')
  @ApiOperation({ summary: '根据二维码ID查询二维码' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '二维码不存在' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findByQrcodeId(@Param('qrcodeId') qrcodeId: string) {
    return this.qrcodesService.findByQrcodeId(qrcodeId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新二维码信息' })
  @ApiResponse({ status: 200, description: '二维码信息更新成功' })
  @ApiResponse({ status: 404, description: '二维码不存在' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateQrcodeDto: UpdateQrcodeDto) {
    return this.qrcodesService.update(+id, updateQrcodeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除二维码' })
  @ApiResponse({ status: 200, description: '二维码删除成功' })
  @ApiResponse({ status: 404, description: '二维码不存在' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.qrcodesService.remove(+id);
  }

  @Get(':id(\\d+)')
  @ApiOperation({ summary: '获取二维码详情' })
  @ApiResponse({ status: 200, description: '获取二维码详情成功' })
  @ApiResponse({ status: 404, description: '二维码不存在' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: number) {
    return this.qrcodesService.findOne(id);
}
} 