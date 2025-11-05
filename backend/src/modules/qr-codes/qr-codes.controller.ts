import { Controller, Post, Param, Get, Query, Req, Res, UseGuards, NotFoundException } from '@nestjs/common';
import { QrCodesService } from './qr-codes.service';
import { Request } from 'express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/constants/role.enum';
import { existsSync } from 'fs';

@Controller('qr-codes')
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @Post('generate/:batchId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Producer)
  async generateQrCode(@Param('batchId') batchId: string, @Req() req: Request) {
    // Construct base URL from request
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.qrCodesService.generateQrCodeForBatch(+batchId, baseUrl);
  }

  @Get('scan')
  async scanQrCode(@Query('code') code: string) {
    const qrCode = await this.qrCodesService.findByCode(code);
    if (qrCode && qrCode.isActive) {
      return { url: qrCode.accessUrl };
    }
    return { error: 'Invalid or inactive QR code' };
  }

  // 直接返回批次详情，便于小程序使用
  @Get('scan/detail')
  async scanDetail(@Query('code') code: string) {
    const detail = await this.qrCodesService.getBatchDetailByCode(code);
    if (!detail) throw new NotFoundException('二维码不存在');
    return detail;
  }

  // 展示二维码图片（inline）
  @Get('image/:code')
  async getQrImage(@Param('code') code: string, @Res() res: Response) {
    const normalized = code.toLowerCase().endsWith('.png') ? code.slice(0, -4) : code;
    const { absPath } = await this.qrCodesService.getImageFilePathByCode(normalized);
    if (!existsSync(absPath)) throw new NotFoundException('二维码图片不存在');
    return res.sendFile(absPath);
  }

  // 下载二维码图片（attachment）
  @Get('download/:code')
  async downloadQrImage(@Param('code') code: string, @Res() res: Response) {
    const normalized = code.toLowerCase().endsWith('.png') ? code.slice(0, -4) : code;
    const { absPath, fileName } = await this.qrCodesService.getImageFilePathByCode(normalized);
    if (!existsSync(absPath)) throw new NotFoundException('二维码图片不存在');
    return res.download(absPath, fileName);
  }

  // 小程序可直接用此接口拿到产品详情
  @Get('scan/detail')
  async scanQrCodeDetail(@Query('code') code: string) {
    const detail = await this.qrCodesService.getBatchDetailByCode(code);
    if (!detail) {
      return { error: 'Invalid QR code' };
    }
    return detail;
  }
}
