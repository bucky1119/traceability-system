import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QrcodesService } from './qrcodes.service';
import { QrcodesController } from './qrcodes.controller';
import { Qrcode } from './entities/qrcode.entity';
import { Batch } from '../batches/entities/batch.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Qrcode, Batch, Product])],
  controllers: [QrcodesController],
  providers: [QrcodesService],
  exports: [QrcodesService],
})
export class QrcodesModule {} 