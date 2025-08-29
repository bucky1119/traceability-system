import { DataSource } from 'typeorm';
import { seedData } from './seeds/init-data';

// 数据库配置
const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'traceability_system',
  entities: ['src/**/*.entity.ts'],
  synchronize: true, // 自动同步数据库结构
  logging: true,
  charset: 'utf8mb4',
});

async function initDatabase() {
  try {
    console.log('正在连接数据库...');
    await dataSource.initialize();
    console.log('数据库连接成功！');

    // 初始化种子数据
    await seedData(dataSource);

    console.log('数据库初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

// 运行初始化
initDatabase(); 