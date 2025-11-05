import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCode } from './entities/qr-code.entity';
import { QrCodesService } from './qr-codes.service';
import { QrCodesController } from './qr-codes.controller';
import { ProductBatchesModule } from '../product-batches/product-batches.module';

@Module({
  imports: [TypeOrmModule.forFeature([QrCode]), ProductBatchesModule],
  providers: [QrCodesService],
  controllers: [QrCodesController],
})
export class QrCodesModule {}
