import { adminAPI, productAPI, utils } from '../../../utils/api.js';

Page({
  data: {
    loading: false,
    farmers: [],
    selectedFarmer: null,
    farmerProducts: []
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

  // 选择农户
  selectFarmer(e) {
    const { farmer } = e.currentTarget.dataset;
    this.setData({
      selectedFarmer: farmer
    });
    this.loadFarmerProducts(farmer.id);
  },

  // 加载农户产品
  async loadFarmerProducts(farmerId) {
    try {
      const batches = await productAPI.getProductsWithAuth();
      const list = Array.isArray(batches) ? batches : [];
      const filtered = list.filter(p => p.producerId === farmerId).map(p => ({
        id: p.id,
        vegetableName: p.vegetableName,
        origin: p.origin,
        plantingTime: utils.formatDate(p.plantingTime),
        harvestTime: utils.formatDate(p.harvestTime),
      }));
      this.setData({
        farmerProducts: filtered
      });
    } catch (error) {
      console.error('加载农户产品失败:', error);
      wx.showToast({
        title: '加载产品失败',
        icon: 'none'
      });
    }
  },

  // 查看农户详情
  viewFarmerDetail(e) {
    const { farmer } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '农户详情',
      content: `账号: ${farmer.account || '-'}\n姓名: ${farmer.name || '-'}\n联系电话: ${farmer.phone || '-'}\n注册时间: ${farmer.created_at || '-'}`,
      showCancel: false
    });
  },

  // 查看产品详情
  viewProductDetail(e) {
    const { product } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '产品详情',
      content: `蔬菜名称: ${product.vegetableName}\n产地: ${product.origin}\n种植日期: ${product.plantingTime}\n收获日期: ${product.harvestTime}`,
      showCancel: false
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
}); 