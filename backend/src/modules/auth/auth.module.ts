import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminsModule } from '../admins/admins.module';
import { ProducersModule } from '../producers/producers.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminLocalStrategy } from './strategies/admin-local.strategy';
import { ProducerLocalStrategy } from './strategies/producer-local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    AdminsModule,
    ProducersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your_default_secret',
        signOptions: { expiresIn: '60m' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, AdminLocalStrategy, ProducerLocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
