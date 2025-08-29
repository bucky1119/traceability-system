import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Environment } from './entities/environment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Environment])],
  exports: [TypeOrmModule],
})
export class EnvironmentsModule {} 