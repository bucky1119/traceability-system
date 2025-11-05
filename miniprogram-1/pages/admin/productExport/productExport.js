import { adminAPI } from '../../../utils/api.js';

Page({
  data: {
    loading: false,
    farmers: [],
    selectedFarmer: null,
    farmerIndex: 0,
    
    // 导出参数
    exportParams: {
      farmerId: null,
      startDate: '',
      endDate: ''
    },
    
    // 日期选择器
    showStartDatePicker: false,
    showEndDatePicker: false
  },

  onLoad() {
    this.loadFarmers();
  },

  // 加载农户列表
  async loadFarmers() {
    this.setData({ loading: true });
    
    try {
      const farmers = await adminAPI.getFarmers();
      this.setData({
        farmers: farmers,
        loading: false
      });
    } catch (error) {
      console.error('加载农户失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载农户失败',
        icon: 'none'
      });
    }
  },

  // 农户选择变化
  onFarmerChange(e) {
    const index = e.detail.value;
    const farmer = this.data.farmers[index];
    
    this.setData({
      farmerIndex: index,
      selectedFarmer: farmer,
      'exportParams.farmerId': farmer ? farmer.id : null
    });
  },

  // 显示开始日期选择器
  showStartDatePicker() {
    this.setData({
      showStartDatePicker: true
    });
  },

  // 开始日期选择
  onStartDateChange(e) {
    this.setData({
      'exportParams.startDate': e.detail.value,
      showStartDatePicker: false
    });
  },

  // 显示结束日期选择器
  showEndDatePicker() {
    this.setData({
      showEndDatePicker: true
    });
  },

  // 结束日期选择
  onEndDateChange(e) {
    this.setData({
      'exportParams.endDate': e.detail.value,
      showEndDatePicker: false
    });
  },

  // 导出所有产品
  async exportAllProducts() {
    this.setData({ loading: true });
    
    try {
      const filePath = await adminAPI.downloadProductsCsv();
      // 尝试用系统打开（部分设备可能不支持 CSV 预览）
      wx.openDocument({ filePath, fileType: 'csv', showMenu: true, fail: () => {
        wx.showToast({ title: '已下载CSV', icon: 'success' });
      }});
      
    } catch (error) {
      console.error('导出失败:', error);
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 导出指定农户产品
  async exportFarmerProducts() {
    const { farmerId, startDate, endDate } = this.data.exportParams;
    
    if (!farmerId) {
      wx.showToast({
        title: '请选择农户',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const filePath = await adminAPI.downloadProductsCsv({ producerId: farmerId });
      wx.openDocument({ filePath, fileType: 'csv', showMenu: true, fail: () => {
        wx.showToast({ title: '已下载CSV', icon: 'success' });
      }});
      
    } catch (error) {
      console.error('导出失败:', error);
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
}); 