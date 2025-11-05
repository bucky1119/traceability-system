import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// 导入业务模块
import { ProducersModule } from './modules/producers/producers.module';
import { ProductBatchesModule } from './modules/product-batches/product-batches.module';
import { SafetyInspectionsModule } from './modules/safety-inspections/safety-inspections.module';
import { QrCodesModule } from './modules/qr-codes/qr-codes.module';
import { AdminsModule } from './modules/admins/admins.module';
import { AuthModule } from './modules/auth/auth.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import { StatsModule } from './modules/stats/stats.module';

// 导入实体
import { Producer } from './modules/producers/entities/producer.entity';
import { Admin } from './modules/admins/entities/admin.entity';
import { ProductBatch } from './modules/product-batches/entities/product-batch.entity';
import { SafetyInspection } from './modules/safety-inspections/entities/safety-inspection.entity';
import { QrCode } from './modules/qr-codes/entities/qr-code.entity';
import { SystemConfig } from './modules/system-config/entities/system-config.entity';


@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),

    // 静态文件服务
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        cacheControl: true,
        maxAge: 3600000, // 1小时缓存
      },
    }),

    // 数据库模块
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_DATABASE || 'traceability_system_2',
      entities: [Producer, Admin, ProductBatch, SafetyInspection, QrCode, SystemConfig],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      charset: 'utf8mb4',
    }),

    // 限流模块
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // 业务模块
    ProducersModule,
    ProductBatchesModule,
    SafetyInspectionsModule,
    QrCodesModule,
    AdminsModule,
    AuthModule,
    SystemConfigModule,
    StatsModule,
  ],
})
export class AppModule {} 