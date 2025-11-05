import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 3306),
  username: configService.get('DB_USERNAME', 'root'),
  password: configService.get('DB_PASSWORD', '123456'),
  database: configService.get('DB_DATABASE', 'traceability_system_2'),
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
  charset: 'utf8mb4',
}); 