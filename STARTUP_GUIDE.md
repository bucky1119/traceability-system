# 设施蔬菜溯源系统启动指南

## 系统架构
- **前端**: React + Ant Design (端口: 3001)
- **后端**: NestJS + TypeORM + MySQL (端口: 3000)
- **数据库**: MySQL

## 环境要求
- Node.js >= 16
- MySQL >= 8.0
- npm 或 yarn

## 1. 数据库准备

### 1.1 创建数据库
```sql
CREATE DATABASE traceability_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 1.2 配置数据库连接
在 `backend` 目录下创建 `.env` 文件：
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=traceability_system

# JWT配置
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# 应用配置
PORT=3000
NODE_ENV=development
```

## 2. 后端启动

### 2.1 安装依赖
```bash
cd backend
npm install
```

### 2.2 初始化数据库
```bash
# 初始化数据库结构和种子数据
npm run db:init
```

### 2.3 启动后端服务
```bash
# 开发模式
npm run start:dev

# 或者生产模式
npm run start:prod
```

后端服务将在 `http://localhost:3000` 启动
API文档地址: `http://localhost:3000/api/docs`

## 3. 前端启动

### 3.1 安装依赖
```bash
cd web-admin
npm install
```

### 3.2 配置API地址
在 `web-admin` 目录下创建 `.env` 文件：
```env
# API配置
REACT_APP_API_URL=http://localhost:3000/api

# 应用配置
PORT=3001
REACT_APP_TITLE=设施蔬菜溯源系统
```

### 3.3 启动前端服务
```bash
npm start
```

前端服务将在 `http://localhost:3001` 启动

## 4. 测试账号

系统预置了以下测试账号：

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | admin | 123456 | 拥有所有权限 |
| 生产者1 | producer1 | 123456 | 绿色蔬菜农场 |
| 生产者2 | producer2 | 123456 | 生态农业合作社 |
| 消费者 | consumer1 | 123456 | 普通用户 |

## 5. 常见问题

### 5.1 端口冲突
如果端口被占用，可以修改：
- 后端端口：修改 `backend/.env` 中的 `PORT`
- 前端端口：修改 `web-admin/.env` 中的 `PORT`

### 5.2 数据库连接失败
- 检查MySQL服务是否启动
- 检查数据库连接配置是否正确
- 确保数据库用户有足够权限

### 5.3 CORS错误
后端已配置CORS，支持以下域名：
- http://localhost:3000
- http://localhost:3001
- http://127.0.0.1:3000
- http://127.0.0.1:3001

### 5.4 前端无法调用后端API
- 确保后端服务已启动
- 检查API地址配置是否正确
- 查看浏览器控制台网络请求

## 6. 开发调试

### 6.1 后端调试
```bash
# 调试模式启动
npm run start:debug
```

### 6.2 前端调试
- 打开浏览器开发者工具
- 查看Console和Network标签页
- 检查Redux状态变化

### 6.3 数据库调试
```bash
# 查看数据库日志
npm run start:dev
```

## 7. 部署说明

### 7.1 生产环境配置
- 修改JWT密钥
- 关闭数据库同步模式
- 配置生产环境变量
- 使用PM2或Docker部署

### 7.2 安全配置
- 启用HTTPS
- 配置防火墙
- 定期备份数据库
- 监控系统日志

## 8. 技术支持

如遇到问题，请检查：
1. 控制台错误信息
2. 网络连接状态
3. 数据库连接状态
4. 环境变量配置
5. 依赖包版本兼容性 