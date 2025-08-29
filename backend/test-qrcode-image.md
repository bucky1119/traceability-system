# 二维码图片存储功能测试

## 功能概述

本功能实现了二维码图片的自动存储和管理，包括：

1. **自动生成和存储**：创建二维码时自动生成PNG图片并保存到文件系统
2. **图片信息管理**：在数据库中记录图片URL、文件路径和大小信息
3. **多种访问方式**：支持预览、下载和直接访问二维码图片

## API端点

### 1. 创建二维码（自动生成图片）
```http
POST /qrcodes
Authorization: Bearer <token>
Content-Type: application/json

{
  "batchId": 1,
  "productId": 1
}
```

**响应示例：**
```json
{
  "id": 1,
  "qrcodeId": "uuid-string",
  "batchId": 1,
  "productId": 1,
  "link": "完整的溯源信息JSON",
  "qrcodeDataUrl": "data:image/png;base64,...",
  "qrcodeImageUrl": "http://localhost:3000/qrcodes/image/uuid-string",
  "qrcodeImagePath": "/path/to/uploads/qrcodes/qrcode_uuid-string.png",
  "qrcodeImageSize": 12345,
  "generateTime": "2024-01-01T00:00:00.000Z",
  "scanCount": 0,
  "status": 1
}
```

### 2. 获取二维码图片信息
```http
GET /qrcodes/image-info/{qrcodeId}
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "imageUrl": "http://localhost:3000/qrcodes/image/uuid-string",
  "imageSize": 12345,
  "generateTime": "2024-01-01T00:00:00.000Z",
  "filename": "qrcode_uuid-string.png"
}
```

### 3. 预览二维码图片
```http
GET /qrcodes/preview/{qrcodeId}
```

**响应：** 直接返回PNG图片数据

### 4. 下载二维码图片
```http
GET /qrcodes/download/{qrcodeId}
```

**响应：** 返回可下载的PNG文件

### 5. 直接访问二维码图片
```http
GET /qrcodes/image/{qrcodeId}
```

**响应：** 返回二维码图片的base64数据URL

## 文件存储结构

```
backend/
├── uploads/
│   └── qrcodes/
│       ├── qrcode_uuid-1.png
│       ├── qrcode_uuid-2.png
│       └── ...
```

## 数据库字段

二维码表新增字段：
- `qrcode_image_url`: 图片访问URL
- `qrcode_image_path`: 图片文件路径
- `qrcode_image_size`: 图片文件大小（字节）

## 测试步骤

### 1. 运行数据库迁移
```sql
-- 执行迁移文件
mysql -u root -p traceability_system < database/migrations/003_add_qrcode_image_fields.sql
```

### 2. 创建二维码测试
```bash
# 1. 先创建产品和批次
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "有机黄瓜",
    "batchCode": "BATCH20240101001",
    "producerId": 1,
    "origin": "北京市朝阳区",
    "plantingDate": "2024-01-01",
    "harvestDate": "2024-03-01",
    "testType": "农药残留检测",
    "testDate": "2024-02-28",
    "isQualified": true
  }'

# 2. 创建二维码
curl -X POST http://localhost:3000/qrcodes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": 1,
    "productId": 1
  }'
```

### 3. 测试图片访问
```bash
# 获取图片信息
curl -X GET http://localhost:3000/qrcodes/image-info/{qrcodeId} \
  -H "Authorization: Bearer <token>"

# 预览图片
curl -X GET http://localhost:3000/qrcodes/preview/{qrcodeId} \
  -o preview.png

# 下载图片
curl -X GET http://localhost:3000/qrcodes/download/{qrcodeId} \
  -o download.png
```

## 前端集成示例

### 小程序端使用示例
```javascript
// 1. 获取二维码图片信息
const getQrcodeImageInfo = async (qrcodeId) => {
  const response = await wx.request({
    url: `http://localhost:3000/qrcodes/image-info/${qrcodeId}`,
    header: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// 2. 下载二维码图片到相册
const downloadQrcodeImage = async (qrcodeId) => {
  const response = await wx.request({
    url: `http://localhost:3000/qrcodes/download/${qrcodeId}`,
    responseType: 'arraybuffer'
  });
  
  const fs = wx.getFileSystemManager();
  const filePath = `${wx.env.USER_DATA_PATH}/qrcode_${qrcodeId}.png`;
  
  fs.writeFileSync(filePath, response.data);
  
  await wx.saveImageToPhotosAlbum({
    filePath: filePath
  });
  
  wx.showToast({
    title: '二维码已保存到相册',
    icon: 'success'
  });
};

// 3. 预览二维码图片
const previewQrcodeImage = async (qrcodeId) => {
  const response = await wx.request({
    url: `http://localhost:3000/qrcodes/preview/${qrcodeId}`,
    responseType: 'arraybuffer'
  });
  
  const fs = wx.getFileSystemManager();
  const filePath = `${wx.env.USER_DATA_PATH}/qrcode_${qrcodeId}.png`;
  
  fs.writeFileSync(filePath, response.data);
  
  wx.previewImage({
    urls: [filePath],
    current: filePath
  });
};
```

## 注意事项

1. **文件权限**：确保`uploads/qrcodes`目录有写入权限
2. **存储空间**：定期清理不需要的二维码图片文件
3. **缓存策略**：图片设置了1小时缓存，可根据需要调整
4. **安全性**：图片访问接口已添加适当的权限控制
5. **错误处理**：如果图片文件丢失，系统会自动重新生成

## 性能优化

1. **文件缓存**：使用静态文件服务提供图片访问
2. **数据库索引**：为图片URL字段创建索引
3. **压缩优化**：二维码图片使用PNG格式，平衡质量和大小
4. **CDN集成**：生产环境可配置CDN加速图片访问 