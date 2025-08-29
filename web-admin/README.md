# 设施蔬菜溯源系统 - Web管理后台

## 项目概述

这是设施蔬菜溯源系统的Web管理后台，为管理员提供全面的系统管理功能，包括用户管理、企业管理、产品管理、批次管理、二维码管理等。

## 功能特性

### 系统管理
- 👥 用户管理：添加、编辑、删除用户，分配角色和权限
- 🏢 企业管理：管理企业信息，审核企业资质
- 🔐 角色权限：角色定义和权限分配

### 产品管理
- 🌱 产品信息：管理产品基本信息、分类、图片
- 📦 批次管理：创建和管理产品批次
- 📊 数据统计：产品生产和销售数据统计

### 溯源管理
- 📱 二维码管理：生成、分配、管理溯源二维码
- 📈 扫码统计：查看二维码扫码次数和统计信息
- 🔍 溯源查询：查询产品溯源信息

### 数据管理
- 🌡️ 环境数据：查看和管理生长环境记录
- 🌿 农事操作：查看和管理农事操作记录
- 📋 检测报告：管理产品检测报告

### 报表分析
- 📊 数据报表：生成各类统计报表
- 📈 趋势分析：分析生产和销售趋势
- 📋 导出功能：导出数据报表

## 技术栈

- **前端框架**: React 18
- **UI组件库**: Ant Design 5.x
- **状态管理**: Redux Toolkit
- **路由管理**: React Router 6
- **HTTP客户端**: Axios
- **图表库**: ECharts
- **构建工具**: Create React App
- **代码规范**: ESLint + Prettier

## 项目结构

```
web-admin/
├── public/                   # 静态资源
├── src/
│   ├── components/           # 公共组件
│   │   ├── Sidebar/         # 侧边栏组件
│   │   ├── Header/          # 头部组件
│   │   ├── Table/           # 表格组件
│   │   └── Form/            # 表单组件
│   ├── pages/               # 页面组件
│   │   ├── Login/           # 登录页面
│   │   ├── Dashboard/       # 仪表板
│   │   ├── Users/           # 用户管理
│   │   ├── Enterprises/     # 企业管理
│   │   ├── Products/        # 产品管理
│   │   ├── Batches/         # 批次管理
│   │   ├── Qrcodes/         # 二维码管理
│   │   ├── Reports/         # 报表分析
│   │   └── Settings/        # 系统设置
│   ├── store/               # Redux状态管理
│   │   ├── index.js         # Store配置
│   │   └── slices/          # Redux切片
│   ├── services/            # API服务
│   │   ├── authAPI.js       # 认证API
│   │   ├── userAPI.js       # 用户API
│   │   ├── productAPI.js    # 产品API
│   │   └── index.js         # API配置
│   ├── utils/               # 工具函数
│   │   ├── request.js       # 请求工具
│   │   ├── auth.js          # 认证工具
│   │   └── format.js        # 格式化工具
│   ├── styles/              # 样式文件
│   ├── App.js               # 主应用组件
│   ├── index.js             # 应用入口
│   └── index.css            # 全局样式
├── package.json             # 项目配置
└── README.md               # 项目说明
```

## 页面说明

### 1. 登录页面 (pages/Login)
- 管理员登录
- 演示账号信息
- 系统版本信息

### 2. 仪表板 (pages/Dashboard)
- 系统概览统计
- 数据图表展示
- 快捷操作入口

### 3. 用户管理 (pages/Users)
- 用户列表展示
- 添加/编辑用户
- 角色分配
- 用户状态管理

### 4. 企业管理 (pages/Enterprises)
- 企业列表展示
- 企业信息管理
- 资质审核
- 企业状态管理

### 5. 产品管理 (pages/Products)
- 产品列表展示
- 产品信息管理
- 产品分类管理
- 产品图片管理

### 6. 批次管理 (pages/Batches)
- 批次列表展示
- 批次创建和管理
- 批次状态跟踪
- 批次数据统计

### 7. 二维码管理 (pages/Qrcodes)
- 二维码列表展示
- 二维码生成
- 二维码分配
- 扫码统计

### 8. 报表分析 (pages/Reports)
- 数据统计报表
- 趋势分析图表
- 数据导出功能
- 自定义报表

### 9. 系统设置 (pages/Settings)
- 系统参数配置
- 用户偏好设置
- 系统日志查看
- 数据备份恢复

## 开发环境

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 安装和运行

1. 克隆项目
```bash
git clone <repository-url>
cd traceability-system/web-admin
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
# 创建 .env 文件
cp .env.example .env

# 编辑 .env 文件，配置API地址
REACT_APP_API_URL=http://localhost:3000/api
```

4. 启动开发服务器
```bash
npm start
```

5. 构建生产版本
```bash
npm run build
```

## 配置说明

### 环境变量配置
```env
# API配置
REACT_APP_API_URL=http://localhost:3000/api

# 应用配置
REACT_APP_TITLE=设施蔬菜溯源系统
REACT_APP_VERSION=1.0.0

# 其他配置
REACT_APP_UPLOAD_URL=http://localhost:3000/api/upload
```

### 代理配置
在 `package.json` 中配置代理：
```json
{
  "proxy": "http://localhost:3000"
}
```

## 开发规范

### 代码规范
- 使用 ESLint + Prettier 进行代码格式化
- 遵循 React Hooks 最佳实践
- 使用 TypeScript 进行类型检查
- 组件采用函数式组件 + Hooks

### 命名规范
- 文件名使用 PascalCase
- 组件名使用 PascalCase
- 变量和函数使用 camelCase
- 常量使用 UPPER_SNAKE_CASE

### 组件开发
- 组件采用单一职责原则
- 使用 PropTypes 或 TypeScript 进行类型检查
- 合理使用 React.memo 优化性能
- 组件间通信使用 props 和 context

### 状态管理
- 使用 Redux Toolkit 进行状态管理
- 按功能模块划分 slice
- 使用 createAsyncThunk 处理异步操作
- 合理使用 useSelector 和 useDispatch

## 部署说明

### 开发环境部署
```bash
npm start
```

### 生产环境部署
```bash
# 构建生产版本
npm run build

# 部署到服务器
# 将 build 目录下的文件部署到 Web 服务器
```

### Docker 部署
```dockerfile
# Dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 常见问题

### 1. 登录失败
- 检查后端服务是否正常运行
- 确认用户名密码是否正确
- 检查网络连接状态

### 2. API 请求失败
- 检查 API 地址配置是否正确
- 确认后端服务是否正常运行
- 检查网络连接状态

### 3. 页面加载缓慢
- 检查网络连接状态
- 确认后端服务响应速度
- 检查浏览器缓存

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 实现基础管理功能
- 完成用户认证系统
- 实现数据管理功能

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 许可证

MIT License 