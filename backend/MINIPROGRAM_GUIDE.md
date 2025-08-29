# 小程序二维码使用指南

## 概述

本指南介绍如何在小程序中使用二维码功能，包括生成、预览、下载和保存二维码图片。

## API接口

### 1. 生成二维码
```http
POST http://localhost:3000/api/qrcodes
Authorization: Bearer <token>
Content-Type: application/json

{
  "batchId": 1,
  "productId": 1
}
```

### 2. 预览二维码图片
```http
GET http://localhost:3000/api/qrcodes/preview/{qrcodeId}
```

### 3. 下载二维码图片
```http
GET http://localhost:3000/api/qrcodes/download/{qrcodeId}
```

### 4. 获取二维码base64数据
```http
GET http://localhost:3000/api/qrcodes/image/{qrcodeId}
```

## 小程序实现示例

### 1. 页面结构 (WXML)
```xml
<view class="container">
  <!-- 二维码预览 -->
  <view class="qrcode-section">
    <text class="title">二维码预览</text>
    <image class="qrcode-image" src="{{qrcodeImageUrl}}" mode="aspectFit"></image>
  </view>
  
  <!-- 操作按钮 -->
  <view class="button-section">
    <button class="btn" bindtap="downloadQrcode">下载二维码</button>
    <button class="btn" bindtap="saveToAlbum">保存到相册</button>
    <button class="btn" bindtap="previewQrcode">预览二维码</button>
  </view>
  
  <!-- 产品信息 -->
  <view class="product-info" wx:if="{{productInfo}}">
    <text class="title">产品信息</text>
    <text>产品名称：{{productInfo.name}}</text>
    <text>批次编号：{{productInfo.batchCode}}</text>
    <text>产地：{{productInfo.origin}}</text>
  </view>
</view>
```

### 2. 页面逻辑 (JS)
```javascript
Page({
  data: {
    qrcodeId: '',
    qrcodeImageUrl: '',
    productInfo: null
  },

  onLoad: function(options) {
    // 从页面参数获取二维码ID
    this.setData({
      qrcodeId: options.qrcodeId
    });
    
    // 加载二维码图片
    this.loadQrcodeImage();
    
    // 加载产品信息
    this.loadProductInfo();
  },

  // 加载二维码图片
  loadQrcodeImage: function() {
    const qrcodeId = this.data.qrcodeId;
    const imageUrl = `http://localhost:3000/api/qrcodes/preview/${qrcodeId}`;
    
    this.setData({
      qrcodeImageUrl: imageUrl
    });
  },

  // 加载产品信息
  loadProductInfo: function() {
    const qrcodeId = this.data.qrcodeId;
    
    wx.request({
      url: `http://localhost:3000/api/qrcodes/trace/${qrcodeId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            productInfo: {
              name: res.data.product.name,
              batchCode: res.data.batch.batchCode,
              origin: res.data.product.origin
            }
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '加载产品信息失败',
          icon: 'none'
        });
      }
    });
  },

  // 下载二维码
  downloadQrcode: function() {
    const qrcodeId = this.data.qrcodeId;
    const downloadUrl = `http://localhost:3000/api/qrcodes/download/${qrcodeId}`;
    
    wx.downloadFile({
      url: downloadUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '下载成功',
            icon: 'success'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
  },

  // 保存到相册
  saveToAlbum: function() {
    const qrcodeId = this.data.qrcodeId;
    const downloadUrl = `http://localhost:3000/api/qrcodes/download/${qrcodeId}`;
    
    wx.downloadFile({
      url: downloadUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          // 保存到相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({
                title: '已保存到相册',
                icon: 'success'
              });
            },
            fail: (err) => {
              if (err.errMsg.includes('auth deny')) {
                wx.showModal({
                  title: '提示',
                  content: '需要您授权保存图片到相册',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      wx.openSetting();
                    }
                  }
                });
              } else {
                wx.showToast({
                  title: '保存失败',
                  icon: 'none'
                });
              }
            }
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
  },

  // 预览二维码
  previewQrcode: function() {
    const qrcodeId = this.data.qrcodeId;
    const previewUrl = `http://localhost:3000/api/qrcodes/preview/${qrcodeId}`;
    
    wx.previewImage({
      urls: [previewUrl],
      current: previewUrl
    });
  }
});
```

### 3. 页面样式 (WXSS)
```css
.container {
  padding: 20rpx;
}

.qrcode-section {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.qrcode-image {
  width: 400rpx;
  height: 400rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
}

.button-section {
  margin-bottom: 40rpx;
}

.btn {
  margin: 20rpx 0;
  background-color: #007aff;
  color: white;
  border-radius: 10rpx;
}

.product-info {
  background-color: #f5f5f5;
  padding: 20rpx;
  border-radius: 10rpx;
}

.product-info text {
  display: block;
  margin: 10rpx 0;
  font-size: 28rpx;
}
```

## 使用流程

### 1. 生成二维码
1. 用户创建产品（包含批次信息）
2. 调用生成二维码接口
3. 获得二维码ID

### 2. 显示二维码
1. 使用 `/preview/{qrcodeId}` 接口获取图片URL
2. 在页面中显示二维码图片

### 3. 下载/保存
1. 用户点击下载或保存按钮
2. 调用 `/download/{qrcodeId}` 接口
3. 将图片保存到本地或相册

### 4. 扫码溯源
1. 用户扫描二维码
2. 获取二维码中的链接或ID
3. 调用溯源接口获取产品信息

## 注意事项

1. **域名配置**：在小程序后台配置服务器域名
2. **HTTPS**：生产环境需要使用HTTPS协议
3. **权限申请**：保存到相册需要用户授权
4. **错误处理**：添加适当的错误处理和用户提示
5. **缓存策略**：二维码图片可以适当缓存以提高性能

## 测试建议

1. 在开发工具中测试基本功能
2. 在真机上测试下载和保存功能
3. 测试不同网络环境下的表现
4. 测试二维码扫描功能 