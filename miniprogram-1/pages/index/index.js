import { productAPI, qrcodeAPI, utils } from '../../utils/api.js';

Page({
  data: {
    loading: false,
    products: [],
    filteredProducts: [], // 添加筛选后的产品列表
    searchKeyword: '',
    filterIndex: 0,
    filterOptions: [
      { label: '全部产品', value: 'all' },
      { label: '合格产品', value: 'qualified' },
      { label: '不合格产品', value: 'unqualified' }
    ],
    sortBy: 'time', // time 或 name
    
    // 溯源信息弹窗
    showTraceModal: false,
    traceInfo: null,
    
    // 扫码结果弹窗
    showScanResultModal: false,
    scanResult: null,
    
    // 模拟数据测试
    mockDataStatus: '未测试'
  },

  onLoad() {
    this.loadProducts();
    this.testMockData();
  },

  onShow() {
    // 每次显示页面时重新加载数据
    this.loadProducts();
  },

  // 测试模拟数据
  async testMockData() {
    try {
      const products = await productAPI.getProducts();
      this.setData({
        mockDataStatus: `模拟数据正常，共${products.length}个产品`
      });
    } catch (error) {
      this.setData({
        mockDataStatus: '模拟数据测试失败'
      });
    }
  },

  // 加载产品列表
  async loadProducts() {
    this.setData({ loading: true });

    try {
      const products = await productAPI.getProducts();
      
      // 格式化日期
      const formattedProducts = products.map(product => ({
        ...product,
        created_at: utils.formatDate(product.created_at),
        plantingDate: utils.formatDate(product.plantingDate),
        harvestDate: utils.formatDate(product.harvestDate),
        testDate: utils.formatDate(product.testDate)
      }));

      this.setData({
        products: formattedProducts,
        filteredProducts: formattedProducts, // 初始化筛选后的产品列表
        loading: false
      });

    } catch (error) {
      console.error('加载产品失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 执行搜索
  handleSearch() {
    this.applyFilters();
  },

  // 筛选变化
  onFilterChange(e) {
    const index = e.detail.value;
    
    this.setData({
      filterIndex: index
    });

    this.applyFilters();
  },

  // 应用筛选和搜索
  applyFilters() {
    const { products, searchKeyword, filterIndex, filterOptions } = this.data;
    const filterValue = filterOptions[filterIndex].value;
    
    let filteredProducts = [...products];
    
    // 根据筛选条件过滤产品
    if (filterValue === 'qualified') {
      filteredProducts = products.filter(product => product.isQualified === true);
    } else if (filterValue === 'unqualified') {
      filteredProducts = products.filter(product => product.isQualified === false);
    }
    
    // 根据搜索关键词过滤
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(keyword) ||
        product.batch.batchCode.toLowerCase().includes(keyword)
      );
    }
    
    this.setData({
      filteredProducts: filteredProducts
    });
  },

  // 排序处理
  handleSort(e) {
    const { sort } = e.currentTarget.dataset;
    
    this.setData({
      sortBy: sort
    });

    let sortedProducts = [...this.data.filteredProducts];
    
    if (sort === 'time') {
      sortedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sort === 'name') {
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    this.setData({
      filteredProducts: sortedProducts
    });
  },

  // 跳转到产品详情
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    if (!id || isNaN(Number(id))) {
      wx.showToast({
        title: '产品ID无效',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 处理溯源查询
  async handleTrace(e) {
    const { product } = e.currentTarget.dataset;
    
    wx.showLoading({
      title: '查询中...'
    });

    try {
      // 获取产品的二维码信息
      const qrcodes = await qrcodeAPI.getQrcodes({ productId: product.id });
      
      if (qrcodes.length > 0) {
        const qrcode = qrcodes[0];
        const traceInfo = await qrcodeAPI.getTraceInfo(qrcode.qrcodeId);
        
        this.setData({
          showTraceModal: true,
          traceInfo: traceInfo
        });
      } else {
        wx.showToast({
          title: '该产品暂无二维码',
          icon: 'none'
        });
      }

      wx.hideLoading();

    } catch (error) {
      wx.hideLoading();
      console.error('溯源查询失败:', error);
      wx.showToast({
        title: '查询失败',
        icon: 'none'
      });
    }
  },

  // 扫码溯源
  async handleScan() {
    try {
      const result = await wx.scanCode({
        scanType: ['qrCode']
      });

      wx.showLoading({
        title: '解析中...'
      });

      try {
        // 尝试解析二维码数据
        const scanResult = await qrcodeAPI.decodeQrcodeData({
          qrcodeData: result.result
        });

        this.setData({
          showScanResultModal: true,
          scanResult: scanResult
        });

        wx.hideLoading();

      } catch (error) {
        wx.hideLoading();
        
        // 如果解析失败，尝试直接查询
        try {
          const qrcodeId = result.result.split('/').pop();
          const traceInfo = await qrcodeAPI.getTraceInfo(qrcodeId);
          
          this.setData({
            showScanResultModal: true,
            scanResult: {
              success: true,
              data: traceInfo
            }
          });
        } catch (queryError) {
          this.setData({
            showScanResultModal: true,
            scanResult: {
              success: false,
              message: '无法解析二维码数据'
            }
          });
        }
      }

    } catch (error) {
      console.error('扫码失败:', error);
      wx.showToast({
        title: '扫码失败',
        icon: 'none'
      });
    }
  },

  // 关闭溯源弹窗
  closeTraceModal() {
    this.setData({
      showTraceModal: false,
      traceInfo: null
    });
  },

  // 关闭扫码结果弹窗
  closeScanResultModal() {
    this.setData({
      showScanResultModal: false,
      scanResult: null
    });
  },

  // 查看溯源详情
  viewTraceInfo() {
    if (this.data.scanResult && this.data.scanResult.success) {
      this.setData({
        showScanResultModal: false,
        showTraceModal: true,
        traceInfo: this.data.scanResult.data
      });
    }
  }
});
