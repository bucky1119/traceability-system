import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Producer } from '../producers/entities/producer.entity';
import { ProductBatch } from '../product-batches/entities/product-batch.entity';
import { QrCode } from '../qr-codes/entities/qr-code.entity';
import { SafetyInspection } from '../safety-inspections/entities/safety-inspection.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producer, ProductBatch, QrCode, SafetyInspection]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
