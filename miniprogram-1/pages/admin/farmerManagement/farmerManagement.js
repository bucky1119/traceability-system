import { adminAPI } from '../../../utils/api.js';

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
      const products = await adminAPI.getFarmerProducts(farmerId);
      this.setData({
        farmerProducts: products
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
      content: `用户名: ${farmer.username}\n联系电话: ${farmer.tel}\n所属企业: ${farmer.enterprise}\n产品数量: ${farmer.productCount}\n注册时间: ${farmer.createdAt}`,
      showCancel: false
    });
  },

  // 查看产品详情
  viewProductDetail(e) {
    const { product } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '产品详情',
      content: `产品名称: ${product.name}\n产地: ${product.origin}\n种植日期: ${product.plantingDate}\n收获日期: ${product.harvestDate}\n检测类型: ${product.testType}\n检测日期: ${product.testDate}\n是否合格: ${product.isQualified ? '是' : '否'}`,
      showCancel: false
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
}); 