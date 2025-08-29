# 设施蔬菜溯源系统 - 后端服务

## 项目概述

这是设施蔬菜溯源系统的后端服务，基于 NestJS 框架开发，提供 RESTful API 接口。

## 技术栈

- **框架**: NestJS 10.x
- **数据库**: MySQL 8.0
- **ORM**: TypeORM
- **认证**: JWT + Passport
- **文档**: Swagger
- **验证**: class-validator
- **加密**: bcryptjs

## 功能模块

### 1. 认证模块 (Auth)
- 用户登录
- 用户注册
- JWT 令牌管理

### 2. 用户管理 (Users)
- 用户信息管理
- 用户权限控制

### 3. 角色管理 (Roles)
- 角色定义
- 权限分配

### 4. 企业管理 (Enterprises)
- 企业信息管理
- 企业认证

### 5. 产品管理 (Products)
- 产品信息录入
- 产品分类管理

### 6. 批次管理 (Batches)
- 批次创建
- 批次追踪

### 7. 环境记录 (Environments)
- 生长环境数据记录
- 环境数据分析

### 8. 农事操作 (Actions)
- 农事操作记录
- 操作图片上传

### 9. 二维码管理 (Qrcodes)
- 二维码生成
- 扫码统计

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制环境变量文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置数据库连接信息：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=traceability_system

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# 应用配置
PORT=3000
NODE_ENV=development
```

### 3. 数据库初始化

执行数据库建表脚本：

```bash
mysql -u root -p < ../database/migrations/001_initial_schema.sql
mysql -u root -p < ../database/seeds/001_initial_data.sql
```

### 4. 启动服务

开发模式：

```bash
npm run start:dev
```

生产模式：

```bash
npm run build
npm run start:prod
```

## API 文档

启动服务后，访问 Swagger 文档：

```
http://localhost:3000/api/docs
```

## 数据库迁移

生成迁移文件：

```bash
npm run migration:generate -- src/migrations/MigrationName
```

执行迁移：

```bash
npm run migration:run
```

回滚迁移：

```bash
npm run migration:revert
```

## 项目结构

```
src/
├── modules/                 # 业务模块
│   ├── auth/               # 认证模块
│   ├── users/              # 用户模块
│   ├── roles/              # 角色模块
│   ├── enterprises/        # 企业模块
│   ├── products/           # 产品模块
│   ├── batches/            # 批次模块
│   ├── environments/       # 环境模块
│   ├── actions/            # 操作模块
│   └── qrcodes/            # 二维码模块
├── common/                 # 公共组件
├── config/                 # 配置文件
├── app.module.ts           # 主模块
└── main.ts                 # 应用入口
```

## 开发规范

### 代码风格

- 使用 ESLint + Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 使用装饰器进行依赖注入

### 命名规范

- 文件名使用 kebab-case
- 类名使用 PascalCase
- 方法名使用 camelCase
- 常量使用 UPPER_SNAKE_CASE

### 错误处理

- 使用 NestJS 内置异常过滤器
- 统一错误响应格式
- 记录详细的错误日志

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t traceability-backend .

# 运行容器
docker run -p 3000:3000 traceability-backend
```

### 生产环境配置

1. 设置 `NODE_ENV=production`
2. 配置生产数据库
3. 设置强密码的 JWT_SECRET
4. 配置 HTTPS
5. 设置反向代理

## 测试

运行单元测试：

```bash
npm run test
```

运行 E2E 测试：

```bash
npm run test:e2e
```

## 监控和日志

- 使用 Winston 进行日志记录
- 集成健康检查接口
- 监控 API 性能指标

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 许可证

MIT License 