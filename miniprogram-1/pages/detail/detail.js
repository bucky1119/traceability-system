import { productAPI, qrcodeAPI, utils } from '../../utils/api.js';

Page({
  data: {
    product: null,
    qrcodes: [],
    loading: false,
    
    // 二维码弹窗
    showQrcodeModal: false,
    currentQrcode: null
  },

  onLoad(options) {
    console.log('详情页面加载，参数:', options);
    const { id } = options;
    if (!id || isNaN(Number(id))) {
      console.log('产品ID无效:', id);
      wx.showToast({
        title: '产品ID无效',
        icon: 'none'
      });
      return;
    }
    console.log('设置产品ID:', id);
    this.setData({ productId: id });
    this.loadProductDetail(id);
    this.loadProductQrcodes(id);
  },

  // 页面显示时刷新数据（用于编辑后返回）
  onShow() {
    if (this.data.productId) {
      this.loadProductDetail(this.data.productId);
      this.loadProductQrcodes(this.data.productId);
    }
  },

  // 加载产品详情
  async loadProductDetail(id) {
    console.log('开始加载产品详情，ID:', id);
    this.setData({ loading: true });

    try {
      const product = await productAPI.getProductDetail(id);
      console.log('获取到产品数据:', product);
      
      // 格式化日期
      const formattedProduct = {
        ...product,
        created_at: utils.formatDate(product.created_at),
        plantingDate: utils.formatDate(product.plantingDate),
        harvestDate: utils.formatDate(product.harvestDate),
        testDate: utils.formatDate(product.testDate),
        batch: {
          ...product.batch,
          createTime: utils.formatDate(product.batch.createTime)
        }
      };

      console.log('格式化后的产品数据:', formattedProduct);
      this.setData({
        product: formattedProduct,
        loading: false
      });

    } catch (error) {
      console.error('加载产品详情失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 加载产品二维码
  async loadProductQrcodes(productId) {
    try {
      const qrcodes = await qrcodeAPI.getQrcodes({ productId });
      
      // 格式化日期
      const formattedQrcodes = qrcodes.map(qrcode => ({
        ...qrcode,
        generateTime: utils.formatDateTime(qrcode.generateTime)
      }));

      this.setData({
        qrcodes: formattedQrcodes
      });

    } catch (error) {
      console.error('加载二维码失败:', error);
    }
  },

  // 编辑产品
  handleEdit() {
    console.log('编辑产品按钮被点击');
    console.log('当前产品数据:', this.data.product);
    
    const { id } = this.data.product;
    if (!id) {
      console.log('产品ID无效:', id);
      wx.showToast({
        title: '产品ID无效',
        icon: 'none'
      });
      return;
    }
    
    console.log('准备跳转到编辑页面，产品ID:', id);
    wx.navigateTo({
      url: `/pages/input/input?id=${id}&mode=edit`,
      success: () => {
        console.log('跳转成功');
      },
      fail: (error) => {
        console.error('跳转失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 生成二维码
  async handleGenerateQrcode() {
    const { id, batch } = this.data.product;
    
    wx.showLoading({
      title: '生成中...'
    });

    try {
      const qrcode = await qrcodeAPI.createQrcode({
        productId: id,
        batchId: batch.id
      });

      // 获取二维码图片信息
      const imageInfo = await qrcodeAPI.getQrcodeImageInfo(qrcode.qrcodeId);

      this.setData({
        showQrcodeModal: true,
        currentQrcode: {
          ...qrcode,
          ...imageInfo,
          productName: this.data.product.name,
          batchCode: this.data.product.batch.batchCode,
          generateTime: utils.formatDateTime(qrcode.generateTime),
          // 确保图片URL字段一致
          imageUrl: imageInfo.qrcodeImageUrl || qrcode.qrcodeImageUrl
        }
      });

      // 重新加载二维码列表
      this.loadProductQrcodes(id);

      wx.hideLoading();
      wx.showToast({
        title: '二维码生成成功',
        icon: 'success'
      });

    } catch (error) {
      wx.hideLoading();
      console.error('生成二维码失败:', error);
      wx.showToast({
        title: '生成失败',
        icon: 'none'
      });
    }
  },

  // 删除产品
  handleDelete() {
    const { id, name } = this.data.product;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除产品"${name}"吗？删除后无法恢复。`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await productAPI.deleteProduct(id);
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            
            // 返回上一页
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
            
          } catch (error) {
            console.error('删除失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 预览二维码
  previewQrcode(e) {
    const { qrcode } = e.currentTarget.dataset;
    
    wx.previewImage({
      urls: [qrcode.qrcodeImageUrl],
      current: qrcode.qrcodeImageUrl
    });
  },

  // 下载二维码列表中的二维码
  async downloadQrcodeFromList(e) {
    const { qrcode } = e.currentTarget.dataset;
    
    try {
      wx.showLoading({
        title: '保存中...'
      });

      const tempFilePath = await qrcodeAPI.downloadQrcodeImage(qrcode.qrcodeId);
      
      // 保存到相册
      await wx.saveImageToPhotosAlbum({
        filePath: tempFilePath
      });
      
      wx.hideLoading();
      
      wx.showToast({
        title: '已保存到相册',
        icon: 'success'
      });

    } catch (error) {
      wx.hideLoading();
      console.error('保存失败:', error);
      
      if (error.errMsg && error.errMsg.includes('auth deny')) {
        wx.showModal({
          title: '权限提示',
          content: '需要您授权保存图片到相册',
          showCancel: false
        });
      } else {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    }
  },

  // 保存二维码列表中的二维码到相册
  async saveQrcodeToAlbum(e) {
    const { qrcode } = e.currentTarget.dataset;
    
    try {
      wx.showLoading({
        title: '保存中...'
      });

      const tempFilePath = await qrcodeAPI.downloadQrcodeImage(qrcode.qrcodeId);
      
      // 保存到相册
      await wx.saveImageToPhotosAlbum({
        filePath: tempFilePath
      });
      
      wx.hideLoading();
      
      wx.showToast({
        title: '已保存到相册',
        icon: 'success'
      });

    } catch (error) {
      wx.hideLoading();
      console.error('保存失败:', error);
      
      if (error.errMsg && error.errMsg.includes('auth deny')) {
        wx.showModal({
          title: '权限提示',
          content: '需要您授权保存图片到相册',
          showCancel: false
        });
      } else {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    }
  },

  // 关闭二维码弹窗
  closeQrcodeModal() {
    this.setData({
      showQrcodeModal: false,
      currentQrcode: null
    });
  },

  // 预览当前二维码
  previewCurrentQrcode() {
    if (!this.data.currentQrcode) return;
    
    const imageUrl = this.data.currentQrcode.imageUrl || this.data.currentQrcode.qrcodeImageUrl;
    if (!imageUrl) {
      wx.showToast({
        title: '图片地址无效',
        icon: 'none'
      });
      return;
    }
    
    wx.previewImage({
      urls: [imageUrl],
      current: imageUrl
    });
  },

  // 下载二维码
  async downloadQrcode() {
    if (!this.data.currentQrcode) return;
    
    try {
      wx.showLoading({
        title: '保存中...'
      });

      const tempFilePath = await qrcodeAPI.downloadQrcodeImage(this.data.currentQrcode.qrcodeId);
      
      // 保存到相册
      await wx.saveImageToPhotosAlbum({
        filePath: tempFilePath
      });
      
      wx.hideLoading();
      
      wx.showToast({
        title: '已保存到相册',
        icon: 'success'
      });

    } catch (error) {
      wx.hideLoading();
      console.error('保存失败:', error);
      
      if (error.errMsg && error.errMsg.includes('auth deny')) {
        wx.showModal({
          title: '权限提示',
          content: '需要您授权保存图片到相册',
          showCancel: false
        });
      } else {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    }
  },

  // 保存二维码到相册（弹窗中的保存按钮）
  async saveToAlbum() {
    if (!this.data.currentQrcode) return;
    
    try {
      wx.showLoading({
        title: '保存中...'
      });

      const tempFilePath = await qrcodeAPI.downloadQrcodeImage(this.data.currentQrcode.qrcodeId);
      
      // 保存到相册
      await wx.saveImageToPhotosAlbum({
        filePath: tempFilePath
      });
      
      wx.hideLoading();
      
      wx.showToast({
        title: '已保存到相册',
        icon: 'success'
      });

    } catch (error) {
      wx.hideLoading();
      console.error('保存失败:', error);
      
      if (error.errMsg && error.errMsg.includes('auth deny')) {
        wx.showModal({
          title: '权限提示',
          content: '需要您授权保存图片到相册',
          showCancel: false
        });
      } else {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    }
  },

  // 打开检测报告
  openTestReport() {
    const { testReport } = this.data.product;
    if (testReport) {
      wx.showModal({
        title: '检测报告',
        content: '是否打开检测报告链接？',
        success: (res) => {
          if (res.confirm) {
            // 这里可以打开链接或下载文件
            wx.showToast({
              title: '功能开发中',
              icon: 'none'
            });
          }
        }
      });
    }
  }
});
