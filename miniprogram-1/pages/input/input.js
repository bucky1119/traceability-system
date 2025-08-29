import { productAPI, utils } from '../../utils/api.js';

Page({
  data: {
    submitting: false,
    userInfo: null,
    
    // 表单数据
    form: {
      name: '',
      batchCode: '',
      origin: '',
      plantingDate: '',
      harvestDate: '',
      testType: '',
      testDate: '',
      testReport: '',
      safetyRiskTest: '',
      ingredientTest: '',
      isQualified: false,
      imageUrl: '',
      batchNotes: ''
    }
  },

  onLoad(options) {
    this.checkLoginStatus();
    
    // 检查是否为编辑模式
    if (options.id && options.mode === 'edit') {
      this.setData({
        isEditMode: true,
        editProductId: options.id
      });
      this.loadProductForEdit(options.id);
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/userCenter/userCenter'
        });
      }, 1500);
      return;
    }
    
    this.setData({
      userInfo: userInfo
    });
  },

  // 加载产品数据用于编辑
  async loadProductForEdit(productId) {
    try {
      wx.showLoading({
        title: '加载中...'
      });

      const product = await productAPI.getProductDetail(productId);
      
      // 填充表单数据
      this.setData({
        form: {
          name: product.name || '',
          batchCode: product.batch?.batchCode || '',
          origin: product.origin || '',
          plantingDate: product.plantingDate ? utils.formatDate(product.plantingDate) : '',
          harvestDate: product.harvestDate ? utils.formatDate(product.harvestDate) : '',
          testType: product.testType || '',
          testDate: product.testDate ? utils.formatDate(product.testDate) : '',
          testReport: product.testReport || '',
          safetyRiskTest: product.safetyRiskTest || '',
          ingredientTest: product.ingredientTest || '',
          isQualified: product.isQualified || false,
          imageUrl: product.imageUrl || '',
          batchNotes: product.batch?.notes || ''
        }
      });

      wx.hideLoading();

    } catch (error) {
      wx.hideLoading();
      console.error('加载产品数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        // 压缩图片
        wx.compressImage({
          src: tempFilePath,
          quality: 80,
          success: (compressRes) => {
            this.setData({
              'form.imageUrl': compressRes.tempFilePath
            });
          },
          fail: (error) => {
            console.error('图片压缩失败:', error);
            // 如果压缩失败，使用原图
            this.setData({
              'form.imageUrl': tempFilePath
            });
          }
        });
      },
      fail: (error) => {
        console.error('选择图片失败:', error);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  // 预览图片
  previewImage() {
    if (!this.data.form.imageUrl) return;
    
    wx.previewImage({
      urls: [this.data.form.imageUrl],
      current: this.data.form.imageUrl
    });
  },

  // 删除图片
  removeImage() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除已上传的图片吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            'form.imageUrl': ''
          });
        }
      }
    });
  },

  // 表单输入处理
  onInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`form.${field}`]: value
    });
  },

  // 日期选择处理
  onDateChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`form.${field}`]: value
    });
  },

  // 开关处理
  onSwitchChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`form.${field}`]: value
    });
  },

  // 表单验证
  validateForm() {
    const { name, batchCode } = this.data.form;
    
    if (!name || name.trim() === '') {
      wx.showToast({
        title: '请输入产品名称',
        icon: 'none'
      });
      return false;
    }
    
    if (!batchCode || batchCode.trim() === '') {
      wx.showToast({
        title: '请输入批次编号',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  // 重置表单
  handleReset() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有表单数据吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            form: {
              name: '',
              batchCode: '',
              origin: '',
              plantingDate: '',
              harvestDate: '',
              testType: '',
              testDate: '',
              testReport: '',
              safetyRiskTest: '',
              ingredientTest: '',
              isQualified: false,
              imageUrl: '',
              batchNotes: ''
            }
          });
          
          wx.showToast({
            title: '已重置',
            icon: 'success'
          });
        }
      }
    });
  },

  // 提交表单
  async handleSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.setData({ submitting: true });

    try {
      // 准备提交数据
      const submitData = {
        ...this.data.form,
        producerId: this.data.userInfo.id
      };

      let result;
      let successMessage;

      if (this.data.isEditMode) {
        // 编辑模式：更新产品
        result = await productAPI.updateProduct(this.data.editProductId, submitData);
        successMessage = '产品更新成功！';
      } else {
        // 创建模式：创建新产品
        result = await productAPI.createProduct(submitData);
        successMessage = '产品创建成功！请在"我的产品"页面生成二维码';
      }
      
      wx.showToast({
        title: successMessage,
        icon: 'success',
        duration: 3000
      });

      // 跳转页面
      setTimeout(() => {
        if (this.data.isEditMode) {
          // 编辑模式：返回详情页
          wx.navigateBack();
        } else {
          // 创建模式：跳转到我的产品页面
          wx.navigateTo({
            url: '/pages/myVegetables/myVegetables'
          });
        }
      }, 2000);

    } catch (error) {
      console.error('提交失败:', error);
      wx.showToast({
        title: error.message || '提交失败',
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
    }
  },


  

});
