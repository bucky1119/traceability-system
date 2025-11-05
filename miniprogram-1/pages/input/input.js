import { productAPI, safetyAPI, utils } from '../../utils/api.js';

Page({
  data: {
    submitting: false,
    userInfo: null,
    createdBatchId: null,
    
    // 产品表单
    productForm: {
      name: '',
      vegetableVariety: '',
      origin: '',
      plantingDate: '',
      harvestDate: '',
      imageUrl: '',
      description: ''
    },
    // 安检表单
    safetyForm: {
      riskFactorType: '',
      inspectionDate: '',
      componentAnalysis: '',
      isQualified: false,
      resultImagePath: ''
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
        createdBatchId: product.id,
        productForm: {
          name: product.vegetableName || product.name || '',
          vegetableVariety: product.vegetableVariety || '',
          origin: product.origin || '',
          plantingDate: product.plantingTime ? utils.formatDate(product.plantingTime) : '',
          harvestDate: product.harvestTime ? utils.formatDate(product.harvestTime) : '',
          imageUrl: product.imageUrl || '',
          description: product.description || ''
        },
        // 安检（取第一条记录做回填）
        safetyForm: {
          riskFactorType: (product.safetyInspections && product.safetyInspections[0]?.riskFactorType) || '',
          inspectionDate: (product.safetyInspections && product.safetyInspections[0]?.inspectionTime) ? utils.formatDate(product.safetyInspections[0].inspectionTime) : '',
          componentAnalysis: (product.safetyInspections && product.safetyInspections[0]?.componentAnalysis) || '',
          isQualified: (product.safetyInspections && product.safetyInspections[0]?.manualResult === '合格') || false,
          resultImagePath: ''
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

  // 选择产品图片
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
            this.setData({ 'productForm.imageUrl': compressRes.tempFilePath });
          },
          fail: (error) => {
            console.error('图片压缩失败:', error);
            // 如果压缩失败，使用原图
            this.setData({ 'productForm.imageUrl': tempFilePath });
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

  // 选择安检图片
  chooseSafetyImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        // 压缩
        wx.compressImage({
          src: tempFilePath,
          quality: 80,
          success: (c) => this.setData({ 'safetyForm.resultImagePath': c.tempFilePath }),
          fail: () => this.setData({ 'safetyForm.resultImagePath': tempFilePath })
        });
      },
      fail: (e) => {
        console.error('选择安检图片失败:', e);
        wx.showToast({ title: '选择安检图片失败', icon: 'none' });
      }
    });
  },

  previewSafetyImage() {
    const p = this.data.safetyForm.resultImagePath;
    if (!p) return;
    wx.previewImage({ urls: [p], current: p });
  },

  removeSafetyImage() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除已选择的安检图片吗？',
      success: (res) => { if (res.confirm) this.setData({ 'safetyForm.resultImagePath': '' }); }
    });
  },

  // 预览图片
  previewImage() {
    const p = this.data.productForm.imageUrl;
    if (!p) return;
    wx.previewImage({ urls: [p], current: p });
  },

  // 删除图片
  removeImage() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除已上传的图片吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ 'productForm.imageUrl': '' });
        }
      }
    });
  },

  // 通用输入处理（根据 data-field 自动映射）
  onInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    // 判断写入哪个表单
    if (['name','vegetableVariety','origin','plantingDate','harvestDate','imageUrl','description','batchNotes'].includes(field)) {
      const key = field === 'batchNotes' ? 'description' : field;
      this.setData({ [`productForm.${key}`]: value });
    } else if (['riskFactorType','inspectionDate','componentAnalysis'].includes(field)) {
      this.setData({ [`safetyForm.${field}`]: value });
    }
  },

  // 日期选择处理
  onDateChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    if (['plantingDate','harvestDate'].includes(field)) {
      this.setData({ [`productForm.${field}`]: value });
    } else if (field === 'inspectionDate') {
      this.setData({ 'safetyForm.inspectionDate': value });
    }
  },

  // 开关处理
  onSwitchChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    if (field === 'isQualified') {
      this.setData({ 'safetyForm.isQualified': value });
    }
  },

  // 产品表单验证
  validateProductForm() {
    const f = this.data.productForm;
    if (!f.name || !f.name.trim()) {
      wx.showToast({ title: '请输入产品名称', icon: 'none' });
      return false;
    }
    if (!f.origin || !f.origin.trim()) {
      wx.showToast({ title: '请输入产地', icon: 'none' });
      return false;
    }
    if (!f.plantingDate || !f.harvestDate) {
      wx.showToast({ title: '请选择种植与收获日期', icon: 'none' });
      return false;
    }
    return true;
  },

  // 安检表单验证
  validateSafetyForm() {
    const s = this.data.safetyForm;
    if (!this.data.createdBatchId && !this.data.editProductId) {
      wx.showToast({ title: '请先提交产品', icon: 'none' });
      return false;
    }
    if (!s.riskFactorType || !s.riskFactorType.trim()) {
      wx.showToast({ title: '请输入风险因子类型', icon: 'none' });
      return false;
    }
    if (!s.inspectionDate) {
      wx.showToast({ title: '请选择检测日期', icon: 'none' });
      return false;
    }
    return true;
  },

  // 重置产品表单
  handleReset() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有表单数据吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            productForm: {
              name: '',
              vegetableVariety: '',
              origin: '',
              plantingDate: '',
              harvestDate: '',
              imageUrl: '',
              description: ''
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

  // 提交产品
  async handleCreateProduct() {
    if (!this.validateProductForm()) return;
    if (this.data.submitting) return;
    this.setData({ submitting: true });

    const toISO = (d) => (d ? `${d}T00:00:00Z` : undefined);
    const f = this.data.productForm;
    const payload = {
      vegetableName: f.name,
      vegetableVariety: f.vegetableVariety || undefined,
      origin: f.origin,
      plantingTime: toISO(f.plantingDate),
      harvestTime: toISO(f.harvestDate),
      description: f.description || undefined,
    };

    try {
      let res;
      if (this.data.isEditMode) {
        const isLocalImage = f.imageUrl && !/^https?:\/\//i.test(f.imageUrl);
        if (isLocalImage) {
          await productAPI.updateProductImage({ id: this.data.editProductId, filePath: f.imageUrl });
        }
        res = await productAPI.updateProduct(this.data.editProductId, payload);
        this.setData({ createdBatchId: this.data.editProductId });
        wx.showToast({ title: '产品更新成功', icon: 'success' });
      } else {
        if (f.imageUrl) {
          res = await productAPI.createProductWithImage({ data: payload, filePath: f.imageUrl });
        } else {
          res = await productAPI.createProduct(payload);
        }
        const id = res?.id || res?.data?.id;
        this.setData({ createdBatchId: id });
        wx.showToast({ title: '产品创建成功', icon: 'success' });
      }
    } catch (e) {
      console.error('产品提交失败:', e);
      wx.showToast({ title: '产品提交失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 提交安检
  async handleCreateSafety() {
    if (!this.validateSafetyForm()) return;
    if (this.data.submitting) return;
    this.setData({ submitting: true });

    const toISO = (d) => (d ? `${d}T00:00:00Z` : undefined);
    const batchId = this.data.createdBatchId || this.data.editProductId;
    const s = this.data.safetyForm;
    const payload = {
      batchId,
      riskFactorType: s.riskFactorType,
      inspectionTime: toISO(s.inspectionDate),
      manualResult: s.isQualified ? '合格' : '不合格',
      componentAnalysis: s.componentAnalysis || undefined,
    };

    try {
      if (s.resultImagePath) {
        await safetyAPI.createWithImage({ data: payload, filePath: s.resultImagePath });
      } else {
        await safetyAPI.create(payload);
      }
      wx.showToast({ title: '安检信息提交成功', icon: 'success' });
    } catch (e) {
      console.error('安检提交失败:', e);
      wx.showToast({ title: '安检提交失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },


  

});
