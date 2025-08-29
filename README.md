# 设施蔬菜溯源系统

## 项目概述

设施蔬菜溯源系统是一个基于微信小程序 + Web后台 + Node.js后端的完整溯源解决方案，旨在为消费者提供透明的蔬菜生产信息，帮助生产者记录和管理生产过程，为管理员提供全面的系统管理功能。

## 技术栈

### 后端服务
- **框架**: NestJS
- **数据库**: MySQL 8.0
- **ORM**: TypeORM
- **认证**: JWT
- **API**: RESTful

### 小程序端
- **框架**: 微信原生开发
- **功能**: 扫码溯源、详情展示、生产者录入

### Web管理后台
- **框架**: React 18
- **UI库**: Ant Design
- **状态管理**: Redux Toolkit
- **HTTP客户端**: Axios

## 项目结构

```
traceability-system/
├── backend/                 # NestJS 后端服务
│   ├── src/
│   │   ├── modules/         # 业务模块
│   │   ├── common/          # 公共组件
│   │   ├── config/          # 配置文件
│   │   └── main.ts          # 应用入口
│   ├── package.json
│   └── README.md
├── miniprogram/             # 微信小程序
│   ├── pages/               # 页面文件
│   ├── components/          # 组件
│   ├── utils/               # 工具函数
│   ├── app.js
│   ├── app.json
│   └── project.config.json
├── web-admin/               # Web管理后台
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── components/      # 公共组件
│   │   ├── services/        # API服务
│   │   ├── store/           # Redux状态管理
│   │   └── utils/           # 工具函数
│   ├── package.json
│   └── README.md
├── database/                # 数据库相关
│   ├── migrations/          # 数据库迁移文件
│   └── seeds/               # 初始数据
├── docs/                    # 项目文档
└── README.md               # 项目说明
```

## 用户角色

### 1. 消费者
- 扫码查看蔬菜溯源信息
- 查看产品详情、生产记录、环境数据
- 查看检测报告和认证信息

### 2. 生产者
- 记录农事操作（播种、施肥、除草等）
- 记录生长环境数据（温度、湿度、光照等）
- 上传操作照片和检测报告
- 生成和管理二维码

### 3. 管理员
- 管理用户账户和企业信息
- 管理产品信息和分类
- 分配和管理二维码
- 设置用户权限和角色
- 查看系统统计和报表

## 开发环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- 微信开发者工具
- Git

## 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/bucky1119/traceability-system.git
cd traceability-system
```

### 2. 安装依赖
```bash
# 后端依赖
cd backend
npm install

# Web管理后台依赖
cd ../web-admin
npm install
```

### 3. 配置数据库
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE traceability_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 启动服务
```bash
# 启动后端服务
cd backend
npm run start:dev

# 启动Web管理后台
cd ../web-admin
npm start
```
## 日常开发工作流程
### 获取最新代码
```bash
#每天开始工作前，先拉取最新代码
git pull origin main
#创建并切换到新功能分支
git checkout -b feature/user-authentication
#开发完成后提交
git add .
git commit -m "feat: 添加用户认证功能"
 推送到远程分支
git push origin feature/user-authentication
```
### 代码合并流程
```bash
#切换到主分支
git checkout main
#合并功能分支
git merge feature/user-authentication
#推送到远程
git push origin main
#删除本地功能分支
git branch -d feature/user-authentication
```

## API文档

后端API文档地址：`http://localhost:3000/api/docs`

## 开发规范

- 代码规范遵循ESLint + Prettier
- 提交信息使用Conventional Commits规范
- 分支管理使用Git Flow工作流
## 实际工作流程示例
~~~bash
# 1. 获取最新代码
git checkout main
git pull origin main
# 2. 创建功能分支
git checkout -b feature/qr-code-generation
# 3. 开发代码...
# 4. 提交代码
git add .
git commit -m "feat: 实现二维码生成功能"
# 5. 推送到远程
git push origin feature/qr-code-generation
# 6. 在 GitHub 上创建 Pull Request
# 7. 等待审查和合并
~~~
## 修复 Bug
~~~bash
# 1. 创建修复分支
git checkout -b hotfix/qr-code-bug

# 2. 修复代码...
# 3. 提交修复
git commit -m "fix: 修复二维码显示问题"

# 4. 推送到远程
git push origin hotfix/qr-code-bug

# 5. 快速合并到主分支
~~~
## 部署说明

详细的部署说明请参考各子项目的README文档。

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。 
