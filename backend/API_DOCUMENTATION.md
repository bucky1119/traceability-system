# 设施蔬菜溯源系统 API 文档

## 概述

本系统提供完整的设施蔬菜溯源管理API，包括用户管理、企业管理、产品管理、批次管理、二维码管理等核心功能。

## 基础信息

- **基础URL**: `http://localhost:3000`
- **API版本**: v1
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON

## 认证

### 登录
```
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 注册
```
POST /auth/register
Content-Type: application/json

{
  "username": "producer1",
  "password": "producer123",
  "tel": "13800138001",
  "roleId": 2,
  "enterpriseId": 1
}
```

## 用户管理

### 获取用户列表
```
GET /users
Authorization: Bearer <token>
```

### 创建用户
```
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "producer1",
  "password": "producer123",
  "tel": "13800138001",
  "roleId": 2,
  "enterpriseId": 1
}
```

### 更新用户
```
PATCH /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "tel": "13800138002"
}
```

### 删除用户
```
DELETE /users/:id
Authorization: Bearer <token>
```

## 企业管理

### 获取企业列表
```
GET /enterprises
Authorization: Bearer <token>
```

### 创建企业
```
POST /enterprises
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "绿色蔬菜种植基地",
  "contacts": "张三",
  "tel": "13800138001",
  "license": "L123456789",
  "address": "北京市朝阳区绿色农业园区A区"
}
```

### 根据营业执照号查询
```
GET /enterprises/search/license/:license
Authorization: Bearer <token>
```

## 产品管理

### 获取产品列表
```
GET /products
Authorization: Bearer <token>
```

### 创建产品
```
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "有机黄瓜",
  "imageUrl": "https://example.com/image.jpg",
  "producerId": 2,
  "origin": "北京市朝阳区绿色农业园区",
  "plantingDate": "2024-01-15",
  "harvestDate": "2024-03-15",
  "testType": "农残检测",
  "testDate": "2024-03-10",
  "testReport": "https://example.com/report.pdf",
  "isQualified": true
}
```

### 获取合格产品
```
GET /products/qualified
Authorization: Bearer <token>
```

### 获取产品统计
```
GET /products/stats
Authorization: Bearer <token>
```

## 批次管理

### 获取批次列表
```
GET /batches
Authorization: Bearer <token>
```

### 创建批次
```
POST /batches
Authorization: Bearer <token>
Content-Type: application/json

{
  "batchCode": "202401001",
  "productId": 1,
  "notes": "春季第一批有机黄瓜"
}
```

### 根据批次编号查询
```
GET /batches/code/:batchCode
Authorization: Bearer <token>
```

### 获取批次统计
```
GET /batches/stats
Authorization: Bearer <token>
```

## 二维码管理

### 创建二维码
```
POST /qrcodes
Authorization: Bearer <token>
Content-Type: application/json

{
  "batchId": 1,
  "productId": 1,
  "expireTime": "2024-12-31T23:59:59Z"
}
```

### 批量生成二维码
```
POST /qrcodes/batch/:batchId/:count
Authorization: Bearer <token>
```

### 获取二维码列表
```
GET /qrcodes
Authorization: Bearer <token>
```

### 获取二维码图片
```
GET /qrcodes/image/:qrcodeId
```

### 获取二维码统计
```
GET /qrcodes/stats
Authorization: Bearer <token>
```

## 溯源查询（公共接口）

### 查询产品溯源信息
```
GET /qrcodes/trace/:qrcodeId
```

**响应示例**:
```json
{
  "qrcode": {
    "id": 1,
    "qrcodeId": "uuid-string",
    "generateTime": "2024-01-15T10:00:00Z",
    "scanCount": 5,
    "status": 1
  },
  "product": {
    "id": 1,
    "name": "有机黄瓜",
    "origin": "北京市朝阳区绿色农业园区",
    "plantingDate": "2024-01-15",
    "harvestDate": "2024-03-15",
    "isQualified": true
  },
  "batch": {
    "id": 1,
    "batchCode": "202401001",
    "notes": "春季第一批有机黄瓜"
  }
}
```

## 错误响应

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["用户名不能为空"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "用户名或密码错误",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "用户不存在",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "用户名已存在",
  "error": "Conflict"
}
```

## 状态码说明

- `QrcodeStatus.UNBOUND = 0` - 未绑定
- `QrcodeStatus.ACTIVE = 1` - 激活
- `QrcodeStatus.EXPIRED = 2` - 过期
- `QrcodeStatus.DISABLED = 3` - 禁用

## 开发环境

### 启动服务
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run start:dev
```

### 访问Swagger文档
启动服务后访问: `http://localhost:3000/api-docs`

### 环境变量配置
创建 `.env` 文件并配置以下变量：
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=traceability_system
JWT_SECRET=your_jwt_secret
QRCODE_BASE_URL=https://your-domain.com/trace
``` 