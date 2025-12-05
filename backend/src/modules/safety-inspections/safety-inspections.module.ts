import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SafetyInspection } from './entities/safety-inspection.entity';
import { ProductBatch } from '../product-batches/entities/product-batch.entity';
import { SafetyInspectionsController } from './safety-inspections.controller';
import { SafetyInspectionsService } from './safety-inspections.service';

@Module({
  imports: [TypeOrmModule.forFeature([SafetyInspection, ProductBatch])],
  controllers: [SafetyInspectionsController],
  providers: [SafetyInspectionsService],
  exports: [SafetyInspectionsService],
})
export class SafetyInspectionsModule {}
