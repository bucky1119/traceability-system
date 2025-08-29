import { adminAPI } from '../../../utils/api.js';

Page({
  data: {
    loading: false,
    systemStats: null,
    productStats: null,
    enterpriseStats: null,
    qrcodeStats: null
  },

  onLoad() {
    this.loadAllStats();
  },

  // 加载所有统计数据
  async loadAllStats() {
    this.setData({ loading: true });
    
    try {
      const [systemStats, productStats, enterpriseStats, qrcodeStats] = await Promise.all([
        adminAPI.getSystemStats(),
        adminAPI.getProductStats(),
        adminAPI.getEnterpriseStats(),
        adminAPI.getQrcodeStats()
      ]);
      
      this.setData({
        systemStats,
        productStats,
        enterpriseStats,
        qrcodeStats,
        loading: false
      });
      
    } catch (error) {
      console.error('加载统计数据失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载统计数据失败',
        icon: 'none'
      });
    }
  },

  // 刷新数据
  refreshData() {
    this.loadAllStats();
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
}); 