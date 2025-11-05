import { productAPI, safetyAPI, qrcodeAPI, utils } from '../../utils/api.js';
const config = require('../../config.js');

Page({
  data: {
    loading: false,
    id: null,
    product: null,
    imageFullUrl: '',
    // 只读模式（扫码进入）
    viewOnly: false,
    // 二维码
    qrcodes: [],
    showQrcodeModal: false,
    currentQrcode: null,

    // 产品编辑
    editProductMode: false,
    productForm: {
      name: '',
      vegetableVariety: '',
      origin: '',
      plantingDate: '',
      harvestDate: '',
      description: '',
      imageUrlLocal: '' // 本地临时图片路径（选择后）
    },

    // 安检
    safetyInspections: [],
    showSafetyModal: false,
    safetyForm: {
      id: null, // 为空表示新建
      riskFactorType: '',
      inspectionDate: '',
      componentAnalysis: '',
      isQualified: false,
      resultImageLocal: ''
    },
  },

  onLoad(options) {
    const id = options?.id ? Number(options.id) : null;
    if (!id) {
      wx.showToast({ title: '参数缺失', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1200);
      return;
    }
    const viewOnly = (options?.view === 'readonly') || (options?.viewOnly === '1') || (options?.readonly === '1');
    this.setData({ id, viewOnly });
    this.loadProduct();
  },

  buildOriginBase() {
    const apiBase = config.getBaseUrl();
    return apiBase.replace(/\/api\/?$/, '');
  },

  async loadProduct() {
    this.setData({ loading: true });
    try {
      const p = await productAPI.getProductDetail(this.data.id);
      const originBase = this.buildOriginBase();
      const imageFullUrl = p.imageUrl ? `${originBase}${p.imageUrl}` : '';
      const plantingDateDisplay = p.plantingTime ? utils.formatDate(p.plantingTime) : '';
      const harvestDateDisplay = p.harvestTime ? utils.formatDate(p.harvestTime) : '';
      const producerName = p.producer ? (p.producer.name || p.producer.account || '') : '';
      const producerPhone = p.producer ? (p.producer.phone || '') : '';

      const safetyInspections = Array.isArray(p.safetyInspections) ? p.safetyInspections.map(si => ({
        ...si,
        inspectionDate: utils.formatDate(si.inspectionTime),
        isQualified: si.manualResult === '合格',
        resultImageFullUrl: si.result_image_url ? `${originBase}${si.result_image_url}` : ''
      })) : [];

      // 映射二维码列表（如果后端返回了 qrCodes）
      const qrcodes = Array.isArray(p.qrCodes)
        ? p.qrCodes.map((q) => ({
            code: q.codeData,
            imageUrl: qrcodeAPI.getQrcodeImageInfo(q.codeData).imageUrl,
            scanCount: q.scanCount || 0,
            generateTime: utils.formatDateTime(q.createdAt),
          }))
        : [];

      this.setData({
        product: p,
        imageFullUrl,
        plantingDateDisplay,
        harvestDateDisplay,
        producerName,
        producerPhone,
        qrcodes,
        safetyInspections,
        loading: false,
      });
    } catch (e) {
      console.error('加载详情失败:', e);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 生成二维码
  async handleGenerateQrcode() {
    if (this._genLock) return;
    this._genLock = true;
    wx.showLoading({ title: '生成中...' });
    try {
      const res = await qrcodeAPI.createQrcode(this.data.id);
      const code = res?.qrCodeEntity?.codeData || res?.code || res?.data?.code;
      const imageInfo = qrcodeAPI.getQrcodeImageInfo(code);
      this.setData({
        showQrcodeModal: true,
        currentQrcode: {
          code,
          imageUrl: imageInfo.imageUrl,
          productName: this.data.product?.vegetableName || '',
          generateTime: utils.formatDateTime(new Date()),
        },
      });
      await this.loadProduct(); // 刷新列表
      wx.showToast({ title: '生成成功', icon: 'success' });
    } catch (e) {
      console.error('生成二维码失败:', e);
      wx.showToast({ title: '生成失败', icon: 'none' });
    }
    wx.hideLoading();
    this._genLock = false;
  },

  previewQrcode(e) {
    const { qrcode } = e.currentTarget.dataset;
    if (!qrcode?.imageUrl) return;
    wx.previewImage({ urls: [qrcode.imageUrl], current: qrcode.imageUrl });
  },

  async saveQrcodeToAlbum(e) {
    const { qrcode } = e.currentTarget.dataset;
    if (!qrcode?.code) return;
    try {
      wx.showLoading({ title: '保存中...' });
      const tempFilePath = await qrcodeAPI.downloadQrcodeImage(qrcode.code);
      await wx.saveImageToPhotosAlbum({ filePath: tempFilePath });
      wx.showToast({ title: '已保存到相册', icon: 'success' });
    } catch (err) {
      console.error('保存二维码失败:', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
    wx.hideLoading();
  },

  closeQrcodeModal() {
    this.setData({ showQrcodeModal: false, currentQrcode: null });
  },

  previewCurrentQrcode() {
    const imageUrl = this.data.currentQrcode?.imageUrl;
    if (!imageUrl) return;
    wx.previewImage({ urls: [imageUrl], current: imageUrl });
  },

  async saveToAlbum() {
    const code = this.data.currentQrcode?.code;
    if (!code) return;
    try {
      wx.showLoading({ title: '保存中...' });
      const tempFilePath = await qrcodeAPI.downloadQrcodeImage(code);
      await wx.saveImageToPhotosAlbum({ filePath: tempFilePath });
      wx.showToast({ title: '已保存到相册', icon: 'success' });
    } catch (err) {
      console.error('保存失败:', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
    wx.hideLoading();
  },

  // 切换产品编辑模式
  enterEditProduct() {
    if (this.data.viewOnly) return;
    const p = this.data.product || {};
    this.setData({
      editProductMode: true,
      productForm: {
        name: p.vegetableName || '',
        vegetableVariety: p.vegetableVariety || '',
        origin: p.origin || '',
        plantingDate: p.plantingTime ? utils.formatDate(p.plantingTime) : '',
        harvestDate: p.harvestTime ? utils.formatDate(p.harvestTime) : '',
        description: p.description || '',
        imageUrlLocal: ''
      }
    });
  },
  cancelEditProduct() {
    this.setData({ editProductMode: false });
  },

  onProductInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({ [`productForm.${field}`]: value });
  },
  onProductDateChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({ [`productForm.${field}`]: value });
  },
  chooseProductImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        wx.compressImage({
          src: tempFilePath,
          quality: 80,
          success: (c) => this.setData({ 'productForm.imageUrlLocal': c.tempFilePath }),
          fail: () => this.setData({ 'productForm.imageUrlLocal': tempFilePath })
        });
      }
    });
  },
  previewProductImage() {
    const url = this.data.imageFullUrl;
    if (!url) return;
    wx.previewImage({ urls: [url], current: url });
  },

  validateProductForm() {
    const f = this.data.productForm;
    if (!f.name || !f.name.trim()) { wx.showToast({ title: '请输入产品名称', icon: 'none' }); return false; }
    if (!f.origin || !f.origin.trim()) { wx.showToast({ title: '请输入产地', icon: 'none' }); return false; }
    if (!f.plantingDate || !f.harvestDate) { wx.showToast({ title: '请选择种植与收获日期', icon: 'none' }); return false; }
    return true;
  },

  async saveProduct() {
    if (!this.validateProductForm()) return;
    if (this._savingProduct) return;
    this._savingProduct = true;
    wx.showLoading({ title: '保存中...' });
    try {
      const id = this.data.id;
      const f = this.data.productForm;
      const toISO = (d) => (d ? `${d}T00:00:00Z` : undefined);
      const payload = {
        vegetableName: f.name,
        vegetableVariety: f.vegetableVariety || undefined,
        origin: f.origin,
        plantingTime: toISO(f.plantingDate),
        harvestTime: toISO(f.harvestDate),
        description: f.description || undefined,
      };

      // 先更新基本信息
      await productAPI.updateProduct(id, payload);
      // 再更新图片（如选择了本地图片）
      if (f.imageUrlLocal) {
        await productAPI.updateProductImage({ id, filePath: f.imageUrlLocal });
      }
      wx.hideLoading();
      wx.showToast({ title: '已保存', icon: 'success' });
      this.setData({ editProductMode: false });
      this.loadProduct();
    } catch (e) {
      wx.hideLoading();
      console.error('保存失败:', e);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
    this._savingProduct = false;
  },

  // 安检相关
  openCreateSafety() {
    if (this.data.viewOnly) return;
    this.setData({
      showSafetyModal: true,
      safetyForm: {
        id: null,
        riskFactorType: '',
        inspectionDate: '',
        componentAnalysis: '',
        isQualified: false,
        resultImageLocal: ''
      }
    });
  },
  openEditSafety(e) {
    const { item } = e.currentTarget.dataset;
    this.setData({
      showSafetyModal: true,
      safetyForm: {
        id: item.id,
        riskFactorType: item.riskFactorType || '',
        inspectionDate: item.inspectionDate || '',
        componentAnalysis: item.componentAnalysis || '',
        isQualified: item.manualResult === '合格' || item.isQualified === true,
        resultImageLocal: '',
        existingImageUrl: item.resultImageFullUrl || ''
      }
    });
  },
  closeSafetyModal() {
    this.setData({ showSafetyModal: false });
  },
  onSafetyInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({ [`safetyForm.${field}`]: value });
  },
  onSafetyDateChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({ [`safetyForm.${field}`]: value });
  },
  onSafetySwitch(e) {
    const { value } = e.detail;
    this.setData({ 'safetyForm.isQualified': value });
  },
  chooseSafetyImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tmp = res.tempFilePaths[0];
        wx.compressImage({ src: tmp, quality: 80, success: (c) => this.setData({ 'safetyForm.resultImageLocal': c.tempFilePath }), fail: () => this.setData({ 'safetyForm.resultImageLocal': tmp }) });
      }
    });
  },

  // 预览已有安检图片（列表或编辑弹窗中）
  previewSafetyImage(e) {
    const { url } = e.currentTarget.dataset;
    if (!url) return;
    wx.previewImage({ urls: [url], current: url });
  },

  validateSafetyForm() {
    const s = this.data.safetyForm;
    if (!s.riskFactorType || !s.riskFactorType.trim()) { wx.showToast({ title: '请输入风险因子类型', icon: 'none' }); return false; }
    if (!s.inspectionDate) { wx.showToast({ title: '请选择检测日期', icon: 'none' }); return false; }
    return true;
  },

  async saveSafety() {
    if (!this.validateSafetyForm()) return;
    if (this._savingSafety) return;
    this._savingSafety = true;
    wx.showLoading({ title: '保存中...' });
    try {
      const s = this.data.safetyForm;
      const toISO = (d) => (d ? `${d}T00:00:00Z` : undefined);
      const payloadCreate = {
        batchId: this.data.id,
        riskFactorType: s.riskFactorType,
        inspectionTime: toISO(s.inspectionDate),
        manualResult: s.isQualified ? '合格' : '不合格',
        componentAnalysis: s.componentAnalysis || undefined,
      };
      const payloadUpdate = {
        riskFactorType: s.riskFactorType,
        inspectionTime: toISO(s.inspectionDate),
        manualResult: s.isQualified ? '合格' : '不合格',
        componentAnalysis: s.componentAnalysis || undefined,
      };

      if (s.id) {
        // 更新
        await safetyAPI.update(s.id, payloadUpdate);
        if (s.resultImageLocal) {
          await safetyAPI.updateImage({ id: s.id, filePath: s.resultImageLocal });
        }
      } else {
        // 新建
        if (s.resultImageLocal) {
          await safetyAPI.createWithImage({ data: payloadCreate, filePath: s.resultImageLocal });
        } else {
          await safetyAPI.create(payloadCreate);
        }
      }
      wx.hideLoading();
      wx.showToast({ title: '已保存', icon: 'success' });
      this.setData({ showSafetyModal: false });
      this.loadProduct();
    } catch (e) {
      wx.hideLoading();
      console.error('保存安检失败:', e);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
    this._savingSafety = false;
  },

  // 删除安检
  deleteSafety(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该安检记录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await safetyAPI.remove(id);
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadProduct();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },
});

