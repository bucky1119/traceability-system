import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile, Req, Patch, Delete, Res, Query, BadRequestException } from '@nestjs/common';
import type { Express } from 'express';
import { Buffer } from 'buffer';
import { ProductBatchesService } from './product-batches.service';
import { CreateProductBatchDto } from './dto/create-product-batch.dto';
import { UpdateProductBatchDto } from './dto/update-product-batch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/constants/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';

@Controller('product-batches')
export class ProductBatchesController {
  constructor(private readonly productBatchesService: ProductBatchesService) {}

  // 修复 multipart 表单中文乱码与无效字符串的工具方法
  private normalizeDtoStrings<T extends Record<string, any>>(dto: T): T {
    if (!dto) return dto;
    for (const key of Object.keys(dto)) {
      const val = (dto as any)[key];
      if (typeof val === 'string') {
        try {
          // 将可能被按 latin1 解读的字符串纠正为 utf8
          const fixed = Buffer.from(val, 'latin1').toString('utf8');
          (dto as any)[key] = fixed;
        } catch {
          // ignore
        }
        // 如果前端做了 encodeURIComponent，这里尝试还原
        try {
          (dto as any)[key] = decodeURIComponent((dto as any)[key]);
        } catch {}
        // 过滤常见的无效占位字符串
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
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: 'uploads/images',
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  create(@Req() req, @UploadedFile() file: Express.Multer.File, @Body() createProductBatchDto: CreateProductBatchDto) {
    // 角色判断：Producer 强制使用本人ID；Admin 需传入 producerId
    if (req.user?.role === Role.Producer) {
      createProductBatchDto.producerId = req.user.id;
    } else if (req.user?.role === Role.Admin) {
      if (!createProductBatchDto.producerId) {
        throw new BadRequestException('管理员创建产品时必须提供 producerId');
      }
    }
    // 仅在 multipart/form-data 下进行纠偏，避免正常 JSON 被误处理而出现乱码
    const contentType = (req.headers?.['content-type'] || '').toString();
    if (contentType.includes('multipart/form-data')) {
      createProductBatchDto = this.normalizeDtoStrings(createProductBatchDto);
    }
    if (file) {
      createProductBatchDto.imageUrl = `/uploads/images/${file.filename}`;
    }
    return this.productBatchesService.create(createProductBatchDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Producer)
  update(@Param('id') id: string, @Req() req, @Body() dto: UpdateProductBatchDto) {
    // 接受纯 JSON 更新，避免对正常 UTF-8 文本做不必要的转换
    return this.productBatchesService.update(+id, dto, req.user);
  }

  // 仅用于文件上传的编辑别名（为兼容小程序 uploadFile 仅支持 POST）
  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Producer)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: 'uploads/images',
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  updateImage(@Param('id') id: string, @Req() req, @UploadedFile() file: Express.Multer.File) {
    const dto: UpdateProductBatchDto = {} as any;
    if (file) {
      dto.imageUrl = `/uploads/images/${file.filename}`;
    }
    return this.productBatchesService.update(+id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Producer)
  remove(@Param('id') id: string, @Req() req) {
    return this.productBatchesService.remove(+id, req.user);
  }

  // 导出产品批次为 CSV（Excel 可直接打开）
  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Producer)
  async export(
    @Req() req,
    @Res() res: Response,
    @Query('producerId') producerId?: string,
  ) {
    const { filename, content, mime } = await this.productBatchesService.exportCsv(
      producerId ? +producerId : undefined,
      req.user,
    );
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(content);
  }

  @Get()
  findAll() {
    return this.productBatchesService.findAll();
  }

  // 仅返回当前生产者自己的产品列表
  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Producer)
  findMine(@Req() req) {
    return this.productBatchesService.findByProducer(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productBatchesService.findOne(+id);
  }
}
