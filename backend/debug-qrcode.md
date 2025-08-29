# 二维码调试指南

## 问题描述
在小程序"我的产品"界面，点击生成二维码后：
1. 后端能成功生成二维码并保存到 `E:\Project\traceability-system\backend\uploads\qrcodes` 路径
2. 前端无法显示二维码图片
3. 下载或保存二维码文件时，下载下来的不是图片文件

## 已修复的问题

### 1. 静态文件服务配置
- 在 `main.ts` 中添加了静态文件服务配置
- 使用 `app.useStaticAssets()` 来服务 `uploads` 目录下的文件

### 2. 二维码图片URL构建
- 修改了 `saveQrcodeImage` 方法中的URL构建逻辑
- 使用静态文件服务URL：`${baseUrl}/uploads/qrcodes/${filename}`

### 3. 前端下载功能
- 修复了 `downloadQrcodeImage` API 的错误处理
- 修复了前端下载和保存功能的文件处理逻辑

### 4. 跨域访问
- 在预览和下载接口中添加了 `Access-Control-Allow-Origin: *` 头

## 调试步骤

### 1. 检查后端服务
```bash
# 确保后端服务正在运行
cd backend
npm run start:dev
```

### 2. 检查文件生成
```bash
# 检查二维码文件是否生成
ls -la uploads/qrcodes/
```

### 3. 测试静态文件访问
在浏览器中访问：
```
http://localhost:3000/uploads/qrcodes/qrcode_[qrcodeId].png
```

### 4. 测试API接口
```bash
# 测试预览接口
curl http://localhost:3000/api/qrcodes/preview/[qrcodeId]

# 测试下载接口
curl -H "Authorization: Bearer [token]" http://localhost:3000/api/qrcodes/download/[qrcodeId]
```

### 5. 检查小程序网络请求
在小程序开发者工具中：
1. 打开调试器
2. 查看网络请求
3. 检查二维码图片URL是否正确
4. 检查下载请求是否成功

## 常见问题

### 1. 图片无法显示
- 检查静态文件服务是否配置正确
- 检查文件路径是否正确
- 检查CORS配置

### 2. 下载失败
- 检查认证token是否正确
- 检查文件是否存在
- 检查响应头设置

### 3. 文件格式错误
- 确保返回的是正确的PNG格式
- 检查Content-Type头设置
- 检查文件内容是否正确

## 测试脚本
运行 `test-qrcode.js` 来测试所有功能：
```bash
cd backend
node test-qrcode.js
```

## 详情页面修复

### 编辑功能
- 修复了详情页面的编辑功能
- 在input页面添加了编辑模式支持
- 编辑模式下会加载现有产品数据
- 支持产品信息的更新

### 二维码列表功能
- 为二维码列表添加了下载和保存按钮
- 每个二维码都可以单独下载或保存到相册
- 修复了二维码下载的文件格式问题

### 文件格式问题修复
- 修复了下载文件不是图片格式的问题
- 使用 `fs.copyFileSync` 正确处理临时文件
- 确保下载的文件是有效的PNG格式

## 修复后的预期行为
1. 生成二维码后，图片应该能正常显示
2. 下载功能应该返回正确的PNG文件
3. 保存到相册功能应该正常工作
4. 图片URL应该可以直接在浏览器中访问
5. 详情页面的编辑功能正常工作
6. 二维码列表支持下载和保存功能
