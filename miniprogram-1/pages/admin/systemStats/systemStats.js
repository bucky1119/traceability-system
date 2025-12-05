import { statsAPI } from '../../../utils/api.js';

Page({
  data: {
    loading: false,
    systemStats: null,
    productStats: null,
    qrcodeStats: null,
  },

  onLoad() {
    this.loadAllStats();
  },

  // 加载所有统计数据
  async loadAllStats() {
    this.setData({ loading: true });
    try {
      const data = await statsAPI.getDashboard();
      const systemStats = {
        totalUsers: data.totalProducers || 0,
        totalProducts: data.totalProducts || 0,
        totalQrcodes: data.totalQrcodes || 0,
        totalScans: data.totalScans || 0,
      };
      const productStats = {
        qualifiedCount: data.qualifiedProducts || 0,
        unqualifiedCount: data.unqualifiedProducts || 0,
        qualifiedRate: (data.totalProducts ? Math.round(((data.qualifiedProducts || 0) / data.totalProducts) * 100) : 0),
        monthlyNew: 0,
      };
      const qrcodeStats = {
        totalGenerated: data.totalQrcodes || 0,
        totalScanned: data.totalScans || 0,
        averageScans: 0,
        monthlyNew: 0,
      };
      this.setData({ systemStats, productStats, qrcodeStats, loading: false });
    } catch (e) {
      console.error('加载统计数据失败:', e);
      this.setData({ loading: false });
      wx.showToast({ title: '加载统计数据失败', icon: 'none' });
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