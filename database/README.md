# 数据库迁移说明

## 二维码图片存储功能迁移

为了支持二维码图片的自动存储和管理功能，需要运行以下迁移文件：

### 1. 修改二维码link字段类型

```sql
-- 执行迁移文件
mysql -u root -p traceability_system < migrations/002_update_qrcode_link_field.sql
```

这个迁移将`qrcodes`表的`link`字段从`VARCHAR(200)`修改为`LONGTEXT`，以支持存储完整的溯源信息JSON数据。

### 2. 添加二维码图片存储字段

```sql
-- 执行迁移文件
mysql -u root -p traceability_system < migrations/003_add_qrcode_image_fields.sql
```

这个迁移添加了以下字段到`qrcodes`表：
- `qrcode_image_url`: 图片访问URL
- `qrcode_image_path`: 图片文件路径
- `qrcode_image_size`: 图片文件大小（字节）

### 3. 验证迁移结果

```sql
-- 检查表结构
DESCRIBE qrcodes;
```

应该看到以下字段：
- `link` 类型为 `LONGTEXT`
- `qrcode_image_url` 类型为 `VARCHAR(500)`
- `qrcode_image_path` 类型为 `VARCHAR(500)`
- `qrcode_image_size` 类型为 `INT`

### 4. 创建上传目录

确保后端项目中有以下目录结构：

```
backend/
├── uploads/
│   └── qrcodes/
```

如果目录不存在，系统会自动创建。

## 功能说明

### 二维码图片存储流程

1. **生成二维码时**：
   - 自动生成PNG格式的二维码图片
   - 保存图片文件到`uploads/qrcodes/`目录
   - 在数据库中记录图片URL、路径和大小信息

2. **图片访问方式**：
   - 预览：`GET /qrcodes/preview/{qrcodeId}`
   - 下载：`GET /qrcodes/download/{qrcodeId}`
   - 信息：`GET /qrcodes/image-info/{qrcodeId}`

3. **文件命名规则**：
   - 格式：`qrcode_{qrcodeId}.png`
   - 示例：`qrcode_550e8400-e29b-41d4-a716-446655440000.png`

### 注意事项

1. **文件权限**：确保`uploads/qrcodes`目录有写入权限
2. **存储空间**：定期清理不需要的二维码图片文件
3. **备份策略**：建议定期备份图片文件
4. **性能优化**：生产环境可配置CDN加速图片访问

## 回滚方案

如果需要回滚迁移，可以执行以下SQL：

```sql
-- 回滚图片字段
ALTER TABLE `qrcodes` 
DROP COLUMN `qrcode_image_url`,
DROP COLUMN `qrcode_image_path`,
DROP COLUMN `qrcode_image_size`;

-- 回滚link字段类型（注意：会丢失数据）
ALTER TABLE `qrcodes` MODIFY COLUMN `link` VARCHAR(200) NOT NULL;
```

**警告**：回滚link字段类型会丢失已存储的完整溯源信息JSON数据。 