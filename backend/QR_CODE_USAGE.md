# 二维码使用说明

## 问题说明

你遇到的404错误是因为直接访问了二维码图片的base64数据URL，而不是溯源信息的API接口。

## 正确的使用方式

### 1. 获取二维码ID
从二维码生成接口的响应中获取 `qrcodeId`：
```json
{
  "qrcodeId": "73ae1323-8617-487f-a843-ca0757658e7f",
  "batchId": 1,
  "productId": 1,
  "link": "https://your-domain.com/trace/73ae1323-8617-487f-a843-ca0757658e7f",
  "qrcodeDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  // ... 其他字段
}
```

### 2. 查询溯源信息
使用正确的API接口查询产品溯源信息：

```http
GET http://localhost:3000/api/qrcodes/trace/73ae1323-8617-487f-a843-ca0757658e7f
```

### 3. 预期响应
```json
{
  "qrcode": {
    "id": 1,
    "qrcodeId": "73ae1323-8617-487f-a843-ca0757658e7f",
    "generateTime": "2025-07-31T15:18:24.000Z",
    "scanCount": 1,
    "status": 1
  },
  "product": {
    "id": 1,
    "name": "有机黄瓜",
    "origin": "山东寿光",
    "plantingDate": "2024-03-01",
    "harvestDate": "2024-06-01",
    "testType": "农残检测",
    "testDate": "2024-05-20",
    "isQualified": true,
    "imageUrl": "http://example.com/cucumber.jpg",
    "producer": {
      "id": 4,
      "username": "farmer001",
      "tel": "13800138000",
      "enterprise": "绿色蔬菜种植基地"
    }
  },
  "batch": {
    "id": 1,
    "batchCode": "BATCH20240301001",
    "productId": 1,
    "createTime": "2025-07-31T15:10:51.000Z",
    "notes": "春季第一批种植"
  }
}
```

## 错误的使用方式

❌ **不要这样做**：
- 直接访问 `qrcodeDataUrl` 中的base64数据
- 访问 `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...` 这样的URL

## 实际应用场景

### 前端应用
1. 用户扫描二维码
2. 前端解析二维码内容，获取 `qrcodeId`
3. 调用 `/api/qrcodes/trace/{qrcodeId}` 接口
4. 显示溯源信息

### 移动应用
1. 相机扫描二维码
2. 获取二维码中的链接或ID
3. 调用溯源API
4. 展示产品信息

## 测试命令

```bash
# 使用curl测试
curl -X GET "http://localhost:3000/api/qrcodes/trace/73ae1323-8617-487f-a843-ca0757658e7f"

# 使用Postman
GET http://localhost:3000/api/qrcodes/trace/73ae1323-8617-487f-a843-ca0757658e7f
```

## 注意事项

1. **公共接口**：溯源查询接口无需认证，任何人都可以访问
2. **扫描统计**：每次访问都会自动增加扫描次数
3. **实时数据**：返回的是最新的产品、生产者和批次信息
4. **错误处理**：如果二维码不存在，会返回404错误 