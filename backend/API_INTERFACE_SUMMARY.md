# 后端API接口总结

## 概述

本文档总结了后端提供的所有API接口，确保前端界面的所有功能模块都有对应的后端支持。

## 用户角色定义

### 1. 消费者（访客）
- **权限**: 无需登录
- **功能**: 查看产品列表、扫码溯源
- **特点**: 公共接口，无需认证

### 2. 生产者（农户/企业）
- **权限**: 需要登录
- **功能**: 录入产品、管理自己的产品、生成二维码
- **特点**: 需要JWT认证

### 3. 管理员
- **权限**: 需要登录且具有管理员权限
- **功能**: 管理农户、录入产品、导出数据、查看统计
- **特点**: 需要JWT认证 + 管理员权限

## API接口分类

### 1. 公共接口（无需登录）

#### 产品相关
```
GET /products/public          # 获取公开产品列表
GET /products/qualified       # 获取合格产品列表
```

#### 溯源相关
```
GET /qrcodes/trace/:qrcodeId     # 查询产品溯源信息
POST /qrcodes/decode             # 解析二维码数据
GET /qrcodes/scan/:qrcodeId      # 扫描二维码（增加扫描次数）
```

### 2. 认证接口

```
POST /auth/login              # 用户登录
POST /auth/register           # 用户注册
GET /auth/me                  # 获取当前用户信息
```

### 3. 生产者接口（需要登录）

#### 产品管理
```
GET /products/my              # 获取我的产品列表
POST /products                # 创建产品
GET /products/:id             # 获取产品详情
PATCH /products/:id           # 更新产品信息
DELETE /products/:id          # 删除产品
```

#### 二维码管理
```
POST /qrcodes                 # 创建二维码
GET /qrcodes                  # 获取二维码列表
GET /qrcodes/:id              # 获取二维码详情
PATCH /qrcodes/:id            # 更新二维码信息
DELETE /qrcodes/:id           # 删除二维码
```

#### 文件上传
```
POST /upload/image            # 上传图片
```

### 4. 管理员接口（需要管理员权限）

#### 农户管理
```
GET /admin/farmers            # 获取农户列表
GET /admin/farmers/:id/products  # 获取指定农户的产品
```

#### 产品管理
```
POST /admin/products          # 为农户录入产品
GET /admin/products/export    # 导出产品信息
GET /admin/products/stats     # 获取产品统计
```

#### 系统统计
```
GET /admin/stats              # 获取系统统计信息
GET /admin/enterprises        # 获取企业统计
GET /admin/qrcodes/stats      # 获取二维码统计
```

### 5. 企业相关接口

```
GET /enterprises              # 获取企业列表
POST /enterprises             # 创建企业
GET /enterprises/:id          # 获取企业详情
PATCH /enterprises/:id        # 更新企业信息
DELETE /enterprises/:id       # 删除企业
```

### 6. 用户管理接口

```
GET /users                    # 获取用户列表
POST /users                   # 创建用户
GET /users/:id                # 获取用户详情
PATCH /users/:id              # 更新用户信息
DELETE /users/:id             # 删除用户
```

### 7. 二维码相关接口

```
GET /qrcodes/image/:qrcodeId      # 获取二维码图片
GET /qrcodes/download/:qrcodeId   # 下载二维码图片
GET /qrcodes/preview/:qrcodeId    # 预览二维码图片
GET /qrcodes/image-info/:qrcodeId # 获取二维码图片信息
```

## 前端功能与后端接口映射

### 1. 首页功能
- ✅ **产品列表展示**: `GET /products/public`
- ✅ **搜索功能**: `GET /products?name=关键词`
- ✅ **筛选功能**: `GET /products/qualified`
- ✅ **扫码溯源**: `GET /qrcodes/trace/:qrcodeId`

### 2. 产品录入功能
- ✅ **图片上传**: `POST /upload/image`
- ✅ **创建产品**: `POST /products`
- ✅ **自动生成二维码**: `POST /qrcodes`

### 3. 我的产品功能
- ✅ **我的产品列表**: `GET /products/my`
- ✅ **产品详情**: `GET /products/:id`
- ✅ **编辑产品**: `PATCH /products/:id`
- ✅ **删除产品**: `DELETE /products/:id`
- ✅ **生成二维码**: `POST /qrcodes`

### 4. 用户中心功能
- ✅ **用户登录**: `POST /auth/login`
- ✅ **用户注册**: `POST /auth/register`
- ✅ **获取用户信息**: `GET /auth/me`
- ✅ **退出登录**: 前端清除token

### 5. 管理员功能
- ✅ **农户产品录入**: `POST /admin/products`
- ✅ **产品信息导出**: `GET /admin/products/export`
- ✅ **农户管理**: `GET /admin/farmers`
- ✅ **系统统计**: `GET /admin/stats`

## 数据模型

### 用户角色
```typescript
enum RoleType {
  ADMIN = 'admin',      // 管理员
  PRODUCER = 'producer', // 生产者
  CONSUMER = 'consumer', // 消费者
}
```

### 产品模型
```typescript
interface Product {
  id: number;
  name: string;
  imageUrl?: string;
  producerId: number;
  origin: string;
  plantingDate: Date;
  harvestDate?: Date;
  testType?: string;
  testDate?: Date;
  isQualified: boolean;
  producerName?: string;
  producerTel?: string;
  producerEnterprise?: string;
  created_at: Date;
  updated_at: Date;
}
```

### 二维码模型
```typescript
interface Qrcode {
  id: number;
  qrcodeId: string;
  productId: number;
  batchId: number;
  generateTime: Date;
  scanCount: number;
  status: number;
}
```

## 权限控制

### 1. 公共接口
- 无需认证，任何人都可以访问
- 主要用于产品展示和溯源查询

### 2. 生产者接口
- 需要JWT认证
- 只能操作自己的产品
- 通过`req.user.id`获取当前用户ID

### 3. 管理员接口
- 需要JWT认证 + 管理员权限
- 使用`AdminGuard`进行权限验证
- 可以操作所有数据

## 错误处理

### 1. 认证错误
```json
{
  "statusCode": 401,
  "message": "用户名或密码错误",
  "error": "Unauthorized"
}
```

### 2. 权限错误
```json
{
  "statusCode": 403,
  "message": "权限不足，需要管理员权限",
  "error": "Forbidden"
}
```

### 3. 数据不存在
```json
{
  "statusCode": 404,
  "message": "产品不存在",
  "error": "Not Found"
}
```

## 测试账号

### 管理员账号
- 用户名: `admin`
- 密码: `123456`
- 权限: 管理员

### 生产者账号
- 用户名: `producer1`
- 密码: `123456`
- 权限: 生产者

### 消费者账号
- 用户名: `consumer1`
- 密码: `123456`
- 权限: 消费者

## 部署配置

### 环境变量
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=traceability_system
JWT_SECRET=your_jwt_secret
APP_URL=http://localhost:3000
```

### 启动命令
```bash
# 开发环境
npm run start:dev

# 生产环境
npm run start:prod
```

## 总结

✅ **已完成的功能**:
1. 完整的用户认证系统
2. 产品管理（CRUD操作）
3. 二维码生成和管理
4. 图片上传功能
5. 管理员权限控制
6. 数据导出功能
7. 系统统计功能
8. 公共溯源接口

✅ **前端需求覆盖**:
1. 消费者无需登录即可查看产品
2. 生产者需要登录才能录入产品
3. 管理员有特殊的管理界面和功能
4. 所有前端功能都有对应的后端接口支持

✅ **安全性**:
1. JWT认证保护敏感接口
2. 管理员权限验证
3. 文件上传安全检查
4. 数据验证和错误处理

后端API接口已经完整覆盖了前端的所有功能需求，可以支持小程序的正常运行。 