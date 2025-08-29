import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Batch } from '../batches/entities/batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User, Batch])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {} 