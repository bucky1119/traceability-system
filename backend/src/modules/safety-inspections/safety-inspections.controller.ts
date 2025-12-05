import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile, Req, Patch, Delete, BadRequestException } from '@nestjs/common';
import type { Express } from 'express';
import { Buffer } from 'buffer';
import { SafetyInspectionsService } from './safety-inspections.service';
import { CreateSafetyInspectionDto } from './dto/create-safety-inspection.dto';
import { UpdateSafetyInspectionDto } from './dto/update-safety-inspection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/constants/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('safety-inspections')
export class SafetyInspectionsController {
  constructor(private readonly safetyInspectionsService: SafetyInspectionsService) {}

  // 处理 multipart 字段的编码/占位
  private normalizeDtoStrings<T extends Record<string, any>>(dto: T): T {
    if (!dto) return dto;
    for (const key of Object.keys(dto)) {
      const val = (dto as any)[key];
      if (typeof val === 'string') {
        try {
          const fixed = Buffer.from(val, 'latin1').toString('utf8');
          (dto as any)[key] = fixed;
        } catch {}
        try {
          (dto as any)[key] = decodeURIComponent((dto as any)[key]);
        } catch {}
        if ((dto as any)[key] === '[object Undefined]' || (dto as any)[key] === 'undefined' || (dto as any)[key] === 'null') {
          (dto as any)[key] = undefined;
        }
      }
    }
    return dto;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Producer)
  @UseInterceptors(FileInterceptor('resultImage', {
    storage: diskStorage({
      destination: 'uploads/images',
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  create(@Req() req, @UploadedFile() file: Express.Multer.File, @Body() createSafetyInspectionDto: CreateSafetyInspectionDto) {
    // 设置创建者为当前用户
    createSafetyInspectionDto.creatorId = req.user.id;
    // 仅在 multipart/form-data 下进行纠偏
    const contentType = (req.headers?.['content-type'] || '').toString();
    if (contentType.includes('multipart/form-data')) {
      createSafetyInspectionDto = this.normalizeDtoStrings(createSafetyInspectionDto);
    }
    // 校正 manualResult 合法值（防止因编码导致的校验失败）
    const mr = (createSafetyInspectionDto as any).manualResult;
    if (mr !== '合格' && mr !== '不合格') {
      // 再尝试一次 utf8 纠偏
      try {
        const fixed = Buffer.from(String(mr || ''), 'latin1').toString('utf8');
        if (fixed === '合格' || fixed === '不合格') {
          (createSafetyInspectionDto as any).manualResult = fixed;
        }
      } catch {}
    }
    if ((createSafetyInspectionDto as any).manualResult !== '合格' && (createSafetyInspectionDto as any).manualResult !== '不合格') {
      throw new BadRequestException('manualResult 必须为 合格 或 不合格');
    }
    if (file) {
      createSafetyInspectionDto.resultImageUrl = `/uploads/images/${file.filename}`;
    }
    return this.safetyInspectionsService.create(createSafetyInspectionDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Producer)
  update(@Param('id') id: string, @Req() req, @Body() dto: UpdateSafetyInspectionDto) {
    // 接受纯 JSON 更新，避免对正常 UTF-8 文本做不必要的转换
    return this.safetyInspectionsService.update(+id, dto, req.user);
  }

  // 仅用于更新安检图片（兼容 uploadFile 仅支持 POST）
  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Producer)
  @UseInterceptors(FileInterceptor('resultImage', {
    storage: diskStorage({
      destination: 'uploads/images',
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  updateImage(@Param('id') id: string, @Req() req, @UploadedFile() file: Express.Multer.File) {
    const dto: UpdateSafetyInspectionDto = {} as any;
    if (file) {
      dto.resultImageUrl = `/uploads/images/${file.filename}`;
    }
    return this.safetyInspectionsService.update(+id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Producer)
  remove(@Param('id') id: string, @Req() req) {
    return this.safetyInspectionsService.remove(+id, req.user);
  }

  @Get()
  findAll() {
    return this.safetyInspectionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.safetyInspectionsService.findOne(+id);
  }

  @Get('batch/:batchId')
  findByBatch(@Param('batchId') batchId: string) {
    return this.safetyInspectionsService.findByBatch(+batchId);
  }
}
