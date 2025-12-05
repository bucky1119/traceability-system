import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductBatch } from './entities/product-batch.entity';
import { SafetyInspection } from '../safety-inspections/entities/safety-inspection.entity';
import { QrCode } from '../qr-codes/entities/qr-code.entity';
import { Producer } from '../producers/entities/producer.entity';
import { ProductBatchesController } from './product-batches.controller';
import { ProductBatchesService } from './product-batches.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductBatch, SafetyInspection, QrCode, Producer])],
  controllers: [ProductBatchesController],
  providers: [ProductBatchesService],
  exports: [ProductBatchesService],
})
export class ProductBatchesModule {}
