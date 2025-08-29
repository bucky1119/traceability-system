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
      { label: '不合格产品', value: 'unqualified' },
      { label: '已生成二维码', value: 'hasQrcode' },
      { label: '未生成二维码', value: 'noQrcode' }
    ],
    
    // 统计数据
    stats: {
      totalProducts: 0,
      totalQrcodes: 0,
      totalScans: 0
    },
    
    // 二维码弹窗
    showQrcodeModal: false,
    currentQrcode: null,
    
    // 搜索防抖
    searchTimer: null
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    console.log('页面显示，检查登录状态');
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    console.log('存储的token:', token);
    console.log('存储的userInfo:', userInfo);
    
    if (token && userInfo) {
      console.log('用户已登录，开始加载数据');
      this.loadProducts();
      this.loadStats();
    } else {
      console.log('用户未登录，跳转到登录页面');
      wx.navigateTo({
        url: '/pages/userCenter/userCenter'
      });
    }
  },

  onUnload() {
    // 清理定时器
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer);
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    console.log('检查登录状态:', { token: !!token, userInfo: !!userInfo });
    
    if (!token || !userInfo) {
      console.log('用户未登录，跳转到登录页面');
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
    
    console.log('用户已登录:', userInfo);
  },

  // 加载产品列表
  async loadProducts() {
    this.setData({ loading: true });

    try {
      console.log('开始加载产品数据...');
      const products = await productAPI.getMyProducts();
      console.log('API返回的产品数据:', products);
      
      // 格式化日期，并兜底batch字段
      const formattedProducts = products.map(product => ({
        ...product,
        created_at: utils.formatDate(product.created_at),
        plantingDate: utils.formatDate(product.plantingDate),
        harvestDate: utils.formatDate(product.harvestDate),
        testDate: utils.formatDate(product.testDate),
        batch: product.batch && typeof product.batch === 'object' ? product.batch : { batchCode: '', createTime: '', notes: '' }
      }));

      console.log('格式化后的产品数据:', formattedProducts);

      this.setData({
        products: formattedProducts,
        filteredProducts: formattedProducts, // 初始化筛选后的产品列表
        loading: false
      });

      // 应用当前的筛选条件
      this.applyFilters();

    } catch (error) {
      console.error('加载产品失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 加载统计数据
  async loadStats() {
    try {
      const [products, qrcodes] = await Promise.all([
        productAPI.getMyProducts(),
        qrcodeAPI.getQrcodes()
      ]);
      
      const totalScans = qrcodes.reduce((sum, qrcode) => sum + qrcode.scanCount, 0);
      
      this.setData({
        stats: {
          totalProducts: products.length,
          totalQrcodes: qrcodes.length,
          totalScans: totalScans
        }
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    
    // 清除之前的定时器
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer);
    }
    
    // 设置防抖，500ms后执行搜索
    const timer = setTimeout(() => {
      this.applyFilters();
    }, 500);
    
    this.setData({
      searchTimer: timer
    });
  },

  // 执行搜索
  handleSearch() {
    this.applyFilters();
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      searchKeyword: ''
    });
    this.applyFilters();
  },

  // 重置筛选
  resetFilters() {
    this.setData({
      searchKeyword: '',
      filterIndex: 0
    });
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
  async applyFilters() {
    const { products, searchKeyword, filterIndex, filterOptions } = this.data;
    const filterValue = filterOptions[filterIndex].value;
    
    console.log('应用筛选，当前数据:', { products: products.length, searchKeyword, filterValue });
    
    let filteredProducts = [...products];
    
    // 根据筛选条件过滤产品
    if (filterValue === 'all') {
      // 显示所有产品，不需要额外过滤
      filteredProducts = [...products];
    } else if (filterValue === 'qualified') {
      filteredProducts = products.filter(product => product.isQualified === true);
    } else if (filterValue === 'unqualified') {
      filteredProducts = products.filter(product => product.isQualified === false);
    } else if (filterValue === 'hasQrcode' || filterValue === 'noQrcode') {
      // 获取二维码数据来判断产品是否已生成二维码
      try {
        const qrcodes = await qrcodeAPI.getQrcodes();
        const productIdsWithQrcode = qrcodes.map(qrcode => qrcode.productId);
        
        if (filterValue === 'hasQrcode') {
          filteredProducts = products.filter(product => productIdsWithQrcode.includes(product.id));
        } else if (filterValue === 'noQrcode') {
          filteredProducts = products.filter(product => !productIdsWithQrcode.includes(product.id));
        }
      } catch (error) {
        console.error('获取二维码数据失败:', error);
        // 如果获取二维码数据失败，则显示所有产品
        filteredProducts = products;
      }
    }
    
    // 根据搜索关键词过滤
    if (searchKeyword && searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(keyword) ||
        (product.batch && product.batch.batchCode && product.batch.batchCode.toLowerCase().includes(keyword))
      );
    }
    
    console.log('筛选后的产品数量:', filteredProducts.length);
    
    this.setData({
      filteredProducts: filteredProducts
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

  // 编辑产品
  handleEdit(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/input/input?id=${id}&mode=edit`
    });
  },

  // 生成二维码
  async handleGenerateQrcode(e) {
    const { product } = e.currentTarget.dataset;
    
    wx.showLoading({
      title: '生成中...'
    });

    try {
      console.log('开始生成二维码，产品信息:', product);
      
      const qrcode = await qrcodeAPI.createQrcode({
        productId: product.id,
        batchId: product.batch.id
      });

      console.log('二维码创建成功:', qrcode);

      // 获取二维码图片信息
      const imageInfo = await qrcodeAPI.getQrcodeImageInfo(qrcode.qrcodeId);
      
      console.log('图片信息获取成功:', imageInfo);

      const currentQrcode = {
        ...qrcode,
        ...imageInfo,
        productName: product.name,
        batchCode: product.batch.batchCode,
        generateTime: utils.formatDateTime(qrcode.generateTime)
      };

      console.log('设置二维码数据:', currentQrcode);

      this.setData({
        showQrcodeModal: true,
        currentQrcode: currentQrcode
      });

      wx.hideLoading();

    } catch (error) {
      wx.hideLoading();
      console.error('生成二维码失败:', error);
      wx.showToast({
        title: '生成二维码失败',
        icon: 'none'
      });
    }
  },

  // 删除产品
  handleDelete(e) {
    const { id, name } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除产品"${name}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await productAPI.deleteProduct(id);
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            
            // 重新加载产品列表
            this.loadProducts();
            
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

  // 关闭二维码弹窗
  closeQrcodeModal() {
    this.setData({
      showQrcodeModal: false,
      currentQrcode: null
    });
  },

  // 预览二维码
  previewQrcode() {
    if (!this.data.currentQrcode) return;
    
    wx.previewImage({
      urls: [this.data.currentQrcode.imageUrl],
      current: this.data.currentQrcode.imageUrl
    });
  },

  // 下载二维码
  async downloadQrcode() {
    if (!this.data.currentQrcode) return;
    
    try {
      wx.showLoading({
        title: '下载中...'
      });

      const tempFilePath = await qrcodeAPI.downloadQrcodeImage(this.data.currentQrcode.qrcodeId);
      
      // 保存到本地文件
      const fs = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/qrcode_${this.data.currentQrcode.qrcodeId}.png`;
      
      // 复制临时文件到本地
      fs.copyFileSync(tempFilePath, filePath);
      
      wx.hideLoading();
      
      wx.showToast({
        title: '下载成功',
        icon: 'success'
      });

    } catch (error) {
      wx.hideLoading();
      console.error('下载失败:', error);
      wx.showToast({
        title: '下载失败',
        icon: 'none'
      });
    }
  },

  // 保存到相册
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

  // 跳转到录入页面
  goToInput() {
    wx.navigateTo({
      url: '/pages/input/input'
    });
  }
});
