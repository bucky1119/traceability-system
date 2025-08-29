import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// 导入业务模块
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { EnterprisesModule } from './modules/enterprises/enterprises.module';
import { ProductsModule } from './modules/products/products.module';
import { BatchesModule } from './modules/batches/batches.module';
import { EnvironmentsModule } from './modules/environments/environments.module';
import { ActionsModule } from './modules/actions/actions.module';
import { QrcodesModule } from './modules/qrcodes/qrcodes.module';
import { AdminModule } from './modules/admin/admin.module';
import { UploadModule } from './modules/upload/upload.module';

// 导入实体
import { User } from './modules/users/entities/user.entity';
import { Role } from './modules/roles/entities/role.entity';
import { Enterprise } from './modules/enterprises/entities/enterprise.entity';
import { Product } from './modules/products/entities/product.entity';
import { Batch } from './modules/batches/entities/batch.entity';
import { Environment } from './modules/environments/entities/environment.entity';
import { Action } from './modules/actions/entities/action.entity';
import { Qrcode } from './modules/qrcodes/entities/qrcode.entity';

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
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'traceability_system',
      entities: [User, Role, Enterprise, Product, Batch, Environment, Action, Qrcode],
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
    AuthModule,
    UsersModule,
    RolesModule,
    EnterprisesModule,
    ProductsModule,
    BatchesModule,
    EnvironmentsModule,
    ActionsModule,
    QrcodesModule,
    AdminModule,
    UploadModule,
  ],
})
export class AppModule {} 