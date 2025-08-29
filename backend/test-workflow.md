# 溯源系统完整业务流程测试

## 业务流程概述

1. **用户注册** → 2. **用户登录** → 3. **创建产品（含批次）** → 4. **生成二维码** → 5. **二维码图片管理** → 6. **消费者扫码查询**

---

## 1. 用户注册（生产者账号）

### 请求
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "farmer001",
  "password": "123456",
  "tel": "13800138000",
  "roleId": 2,
  "enterpriseId": 1
}
```

### 验证点
- ✅ 用户名不能为空
- ✅ 密码不能为空且长度≥6
- ✅ 角色ID必须存在（2=生产者）
- ✅ 用户名不能重复
- ✅ 密码会被加密存储

### 预期响应
```json
{
  "id": 1,
  "username": "farmer001",
  "tel": "13800138000",
  "roleId": 2,
  "enterpriseId": 1,
  "createTime": "2024-01-01T00:00:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 2. 用户登录

### 请求
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "farmer001",
  "password": "123456"
}
```

### 验证点
- ✅ 用户名和密码验证
- ✅ 返回JWT token

### 预期响应
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZhcm1lcjAwMSIsInN1YiI6NCwicm9sZSI6InByb2R1Y2VyIiwiaWF0IjoxNzUzOTcyOTAwLCJleHAiOjE3NTQ1Nzc3MDB9.faZ5QcD1CBHMUa0O6g8P-FqjuVTQx2Z3h4tv74G89X4",
    "user": {
        "id": 4,
        "username": "farmer001",
        "role": {
            "id": 2,
            "name": "生产者",
            "description": "负责记录农事操作和生产环境数据",
            "type": "producer",
            "created_at": "2025-07-31T14:12:10.000Z",
            "updated_at": "2025-07-31T14:12:10.000Z"
        },
        "enterprise": {
            "id": 1,
            "name": "绿色蔬菜种植基地",
            "contacts": "张三",
            "tel": "13800138001",
            "license": "L123456789",
            "address": "北京市朝阳区绿色农业园区A区",
            "created_at": "2025-07-31T14:12:10.000Z",
            "updated_at": "2025-07-31T14:12:10.000Z"
        }
    }
}
```

---

## 3. 创建产品信息（包含批次信息）

### 请求
```http
POST http://localhost:3000/api/products
Authorization: Bearer <eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZhcm1lcjAwMSIsInN1YiI6NCwicm9sZSI6InByb2R1Y2VyIiwiaWF0IjoxNzUzOTcyOTAwLCJleHAiOjE3NTQ1Nzc3MDB9.faZ5QcD1CBHMUa0O6g8P-FqjuVTQx2Z3h4tv74G89X4>
Content-Type: application/json

{
  "name": "有机黄瓜",
  "batchCode": "BATCH20240301001",
  "producerId": 4,
  "imageUrl": "http://example.com/cucumber.jpg",
  "origin": "山东寿光",
  "plantingDate": "2024-03-01",
  "harvestDate": "2024-06-01",
  "testType": "农残检测",
  "testDate": "2024-05-20",
  "testReport": "http://example.com/report.pdf",
  "isQualified": true,
  "batchNotes": "春季第一批种植"
}
```

### 验证点
- ✅ 产品名称不能为空
- ✅ 批次编号不能为空且必须唯一
- ✅ 生产者ID必须存在
- ✅ 同时创建产品和批次记录
- ✅ 自动填充生产者快照信息

### 必填字段验证测试

#### 测试1：产品名称为空
```http
POST http://localhost:3000/api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "",
  "batchCode": "BATCH20240301001",
  "origin": "山东寿光"
}
```

**预期错误**：通过
```json
{
  "statusCode": 400,
  "message": "产品名称不能为空"
}
```

#### 测试2：批次编号为空
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "有机黄瓜",
  "batchCode": "",
  "origin": "山东寿光"
}
```

**预期错误**：通过
```json
{
  "statusCode": 400,
  "message": "批次编号不能为空"
}
```

#### 测试3：批次编号重复
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "有机黄瓜",
  "batchCode": "BATCH20240301001",
  "origin": "山东寿光"
}
```

**预期错误**：通过
```json
{
  "statusCode": 400,
  "message": "批次编号已存在"
}
```

### 成功响应
```json
{
    "product": {
        "name": "有机黄瓜",
        "imageUrl": "http://example.com/cucumber.jpg",
        "producerId": 4,
        "origin": "山东寿光",
        "plantingDate": "2024-03-01",
        "harvestDate": "2024-06-01",
        "testType": "农残检测",
        "testDate": "2024-05-20",
        "testReport": "http://example.com/report.pdf",
        "isQualified": true,
        "producerName": "farmer001",
        "producerTel": "13800138000",
        "producerEnterprise": "绿色蔬菜种植基地",
        "id": 1,
        "created_at": "2025-07-31T15:10:51.000Z",
        "updated_at": "2025-07-31T15:10:51.000Z"
    },
    "batch": {
        "batchCode": "BATCH20240301001",
        "productId": 1,
        "notes": "春季第一批种植",
        "id": 1,
        "createTime": "2025-07-31T15:10:51.000Z",
        "created_at": "2025-07-31T15:10:51.000Z",
        "updated_at": "2025-07-31T15:10:51.000Z"
    }
}
```

---

## 4. 生成二维码

### 请求
```http
POST http://localhost:3000/api/qrcodes
Authorization: Bearer <eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZhcm1lcjAwMSIsInN1YiI6NCwicm9sZSI6InByb2R1Y2VyIiwiaWF0IjoxNzUzOTcyOTAwLCJleHAiOjE3NTQ1Nzc3MDB9.faZ5QcD1CBHMUa0O6g8P-FqjuVTQx2Z3h4tv74G89X4>
Content-Type: application/json

{
  "batchId": 1,
  "productId": 1
}
```

### 验证点
- ✅ 批次和产品必须存在
- ✅ 批次必须属于指定产品
- ✅ 自动生成唯一二维码ID
- ✅ 生成完整的溯源信息JSON
- ✅ 自动生成并保存二维码图片文件
- ✅ 记录图片URL、路径和大小信息

### 预期响应
```json
{
  "statusCode": 404,
  "message": "批次不存在"
}
```

---

## 5. 二维码图片管理

### 5.1 获取二维码图片信息

#### 请求
```http
GET http://localhost:3000/api/qrcodes/image-info/49774d33-ac77-4dc8-b763-f6f5458ab908
Authorization: Bearer <eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZhcm1lcjAwMSIsInN1YiI6NCwicm9sZSI6InByb2R1Y2VyIiwiaWF0IjoxNzUzOTcyOTAwLCJleHAiOjE3NTQ1Nzc3MDB9.faZ5QcD1CBHMUa0O6g8P-FqjuVTQx2Z3h4tv74G89X4>
```

#### 验证点
- ✅ 二维码ID必须存在
- ✅ 返回图片URL、大小、生成时间等信息

#### 预期响应
```json
{
    "imageUrl": "http://localhost:3000/qrcodes/image/49774d33-ac77-4dc8-b763-f6f5458ab908",
    "imageSize": 14979,
    "generateTime": "2025-08-01T09:37:35.000Z",
    "filename": "qrcode_49774d33-ac77-4dc8-b763-f6f5458ab908.png"
}
```

### 5.2 预览二维码图片

#### 请求
```http
GET http://localhost:3000/api/qrcodes/preview/49774d33-ac77-4dc8-b763-f6f5458ab908
```

#### 验证点
- ✅ 直接返回PNG图片数据
- ✅ 设置正确的Content-Type和缓存头

#### 预期响应
```
Content-Type: image/png
Content-Length: 12345
Cache-Control: public, max-age=3600

[PNG图片二进制数据]
```

### 5.3 下载二维码图片

#### 请求
```http
GET http://localhost:3000/api/qrcodes/download/49774d33-ac77-4dc8-b763-f6f5458ab908
```

#### 验证点
- ✅ 返回可下载的PNG文件
- ✅ 设置正确的下载头信息

#### 预期响应
```
Content-Type: image/png
Content-Disposition: attachment; filename="qrcode_550e8400-e29b-41d4-a716-446655440000.png"
Content-Length: 12345

[PNG图片二进制数据]
```

### 5.4 直接访问二维码图片

#### 请求
```http
GET http://localhost:3000/api/qrcodes/image/49774d33-ac77-4dc8-b763-f6f5458ab908
```

#### 验证点
- ✅ 返回二维码图片的base64数据URL
- ✅ 可用于前端直接显示

#### 预期响应
```json
{
  "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

---

## 6. 消费者扫码查询

### 6.1 通过二维码ID查询溯源信息

#### 请求
```http
GET http://localhost:3000/api/qrcodes/trace/49774d33-ac77-4dc8-b763-f6f5458ab908
```

#### 验证点
- ✅ 二维码ID必须存在
- ✅ 自动增加扫描次数
- ✅ 返回完整的溯源信息

#### 预期响应
```json
{
  "qrcode": {
    "id": 1,
    "qrcodeId": "550e8400-e29b-41d4-a716-446655440000",
    "generateTime": "2024-01-01T00:00:00.000Z",
    "scanCount": 1,
    "status": 1
  },
  "product": {
    "id": 1,
    "name": "有机黄瓜",
    "origin": "北京市朝阳区绿色农业园区",
    "plantingDate": "2024-01-01T00:00:00.000Z",
    "harvestDate": "2024-03-01T00:00:00.000Z",
    "testType": "农药残留检测",
    "testDate": "2024-02-28T00:00:00.000Z",
    "isQualified": true,
    "imageUrl": null,
    "producer": {
      "id": 1,
      "username": "farmer001",
      "tel": "13800138000",
      "enterprise": "绿色蔬菜种植基地"
    }
  },
  "batch": {
    "id": 1,
    "batchCode": "BATCH20240101001",
    "productId": 1,
    "createTime": "2024-01-01T00:00:00.000Z",
    "notes": "春季第一批种植"
  }
}
```

### 6.2 解析二维码数据（离线扫码）

#### 请求
```http
POST http://localhost:3000/api/qrcodes/decode
Content-Type: application/json

{
  "qrcodeData": "{\"qrcodeId\":\"49774d33-ac77-4dc8-b763-f6f5458ab908\",\"generateTime\":\"2024-01-01T00:00:00.000Z\",\"product\":{\"id\":1,\"name\":\"有机黄瓜\",\"origin\":\"北京市朝阳区绿色农业园区\",\"plantingDate\":\"2024-01-01T00:00:00.000Z\",\"harvestDate\":\"2024-03-01T00:00:00.000Z\",\"testType\":\"农药残留检测\",\"testDate\":\"2024-02-28T00:00:00.000Z\",\"isQualified\":true,\"producer\":{\"id\":1,\"username\":\"farmer001\",\"tel\":\"13800138000\",\"enterprise\":\"绿色蔬菜种植基地\"}},\"batch\":{\"id\":1,\"batchCode\":\"BATCH20240101001\",\"productId\":1,\"createTime\":\"2024-01-01T00:00:00.000Z\",\"notes\":\"春季第一批种植\"},\"onlineQueryUrl\":\"https://your-domain.com/trace/49774d33-ac77-4dc8-b763-f6f5458ab908\"}"
}
```

#### 验证点
- ✅ 二维码数据格式验证
- ✅ 解析JSON数据
- ✅ 可选地增加扫描次数

#### 预期响应
```json
{
  "success": true,
  "data": {
    "qrcodeId": "550e8400-e29b-41d4-a716-446655440000",
    "generateTime": "2024-01-01T00:00:00.000Z",
    "product": {
      "id": 1,
      "name": "有机黄瓜",
      "origin": "北京市朝阳区绿色农业园区",
      "plantingDate": "2024-01-01T00:00:00.000Z",
      "harvestDate": "2024-03-01T00:00:00.000Z",
      "testType": "农药残留检测",
      "testDate": "2024-02-28T00:00:00.000Z",
      "isQualified": true,
      "producer": {
        "id": 1,
        "username": "farmer001",
        "tel": "13800138000",
        "enterprise": "绿色蔬菜种植基地"
      }
    },
    "batch": {
      "id": 1,
      "batchCode": "BATCH20240101001",
      "productId": 1,
      "createTime": "2024-01-01T00:00:00.000Z",
      "notes": "春季第一批种植"
    },
    "onlineQueryUrl": "https://your-domain.com/trace/550e8400-e29b-41d4-a716-446655440000"
  },
  "message": "二维码解析成功"
}
```

---

## 管理员功能测试

### 1. 管理员登录

#### 请求
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin001",
  "password": "123456"
}
```
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluMDAxIiwic3ViIjo1LCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTQwNDIxNzUsImV4cCI6MTc1NDY0Njk3NX0.Y4c-HwA3TKM_xFOGrionZFFx1nwOaW6xte8zUXKB29Y",
    "user": {
        "id": 5,
        "username": "admin001",
        "role": {
            "id": 1,
            "name": "系统管理员",
            "description": "拥有系统所有权限的管理员",
            "type": "admin",
            "created_at": "2025-07-31T14:12:10.000Z",
            "updated_at": "2025-07-31T14:12:10.000Z"
        },
        "enterprise": null
    }
}
```
### 2. 查看所有用户

#### 请求
```http
GET http://localhost:3000/api/users
Authorization: Bearer <eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluMDAxIiwic3ViIjo1LCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTQwNDIxNzUsImV4cCI6MTc1NDY0Njk3NX0.Y4c-HwA3TKM_xFOGrionZFFx1nwOaW6xte8zUXKB29Y>
```

### 3. 查看所有产品

#### 请求
```http
GET http://localhost:3000/api/products
Authorization: Bearer <eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluMDAxIiwic3ViIjo1LCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTQwNDIxNzUsImV4cCI6MTc1NDY0Njk3NX0.Y4c-HwA3TKM_xFOGrionZFFx1nwOaW6xte8zUXKB29Y>
```

### 4. 查看所有二维码

#### 请求
```http
GET http://localhost:3000/api/qrcodes
Authorization: Bearer <admin_token>
```

### 5. 查看二维码统计信息

#### 请求
```http
GET http://localhost:3000/api/qrcodes/stats
Authorization: Bearer <admin_token>
```

#### 预期响应
```json
{
  "total": 10,
  "active": 8,
  "inactive": 2,
  "totalScans": 150
}
```

---

## 环境变量配置

确保在`.env`文件中配置以下变量：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=traceability_system

# API配置
API_BASE_URL=http://localhost:3000

# 二维码配置
QRCODE_BASE_URL=https://your-domain.com/trace

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

---

## 测试工具推荐

1. **Postman**：用于API测试
2. **curl**：命令行测试
3. **Swagger UI**：访问 `http://localhost:3000/api` 查看API文档
4. **MySQL Workbench**：数据库管理

---

## 常见问题排查

1. **数据库连接失败**：检查数据库服务是否启动，配置是否正确
2. **JWT验证失败**：检查token是否过期，格式是否正确
3. **文件权限错误**：确保`uploads/qrcodes`目录有写入权限
4. **图片访问失败**：检查静态文件服务配置是否正确
5. **二维码生成失败**：检查产品批次关联是否正确

---

## 性能测试建议

1. **并发测试**：使用Apache Bench或JMeter测试并发扫码性能
2. **文件存储测试**：测试大量二维码图片的存储和访问性能
3. **数据库性能**：监控数据库查询性能，必要时添加索引
4. **缓存优化**：考虑使用Redis缓存热点数据
