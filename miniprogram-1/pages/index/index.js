import { productAPI, qrcodeAPI, utils } from '../../utils/api.js';
const config = require('../../config.js');

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
    // 仅在开发+mock模式下做一次模拟数据自检
    this.testMockData();
  },

  onShow() {
    // 每次显示页面时重新加载数据
    this.loadProducts();
  },

  // 测试模拟数据
  async testMockData() {
    try {
        if (config && config.env === 'development' && config.useMockData) {
          const products = await productAPI.getProducts();
          this.setData({ mockDataStatus: `模拟数据正常，共${(products || []).length}个产品` });
        } else {
          this.setData({ mockDataStatus: '未启用模拟数据' });
        }
    } catch (error) {
      this.setData({
        mockDataStatus: '模拟数据测试失败'
      });
    }
  },

  // 加载产品列表
  async loadProducts() {
    if (this._loadingLock) return;
    this._loadingLock = true;
    this.setData({ loading: true });

    try {
      const list = await productAPI.getProducts();
      const originBase = (config.getBaseUrl && config.getBaseUrl()) ? config.getBaseUrl().replace(/\/api\/?$/, '') : '';
      // 适配新接口字段
      const formattedProducts = (Array.isArray(list) ? list : []).map(p => {
        const createdAtFmt = utils.formatDate(p.createdAt);
        const plantingDate = utils.formatDate(p.plantingTime);
        const harvestDate = utils.formatDate(p.harvestTime);
        const producerName = p.producer ? (p.producer.name || p.producer.account || '') : '';
        const isQualified = Array.isArray(p.safetyInspections)
          ? p.safetyInspections.some(si => si && si.manualResult === '合格')
          : false;
        const imageUrlAbs = p.imageUrl ? `${originBase}${p.imageUrl}` : (p.imageUrl || '');
        return {
          ...p,
          // 兼容旧字段命名
          name: p.vegetableName,
          variety: p.vegetableVariety,
          created_at: createdAtFmt,
          plantingDate,
          harvestDate,
          producerName,
          isQualified,
          imageUrl: imageUrlAbs,
        };
      });

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
    } finally {
      this._loadingLock = false;
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
      filteredProducts = filteredProducts.filter(product => {
        const name = (product.name || '').toLowerCase();
        const variety = (product.variety || '').toLowerCase();
        const origin = (product.origin || '').toLowerCase();
        const producer = (product.producerName || '').toLowerCase();
        return (
          name.includes(keyword) ||
          variety.includes(keyword) ||
          origin.includes(keyword) ||
          producer.includes(keyword)
        );
      });
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
      sortedProducts.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
    } else if (sort === 'name') {
      sortedProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
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
      // 首页作为公共浏览入口，统一以只读模式进入
      url: `/pages/detail/detail?id=${id}&view=readonly`
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

  // 扫码溯源（优先解析产品批次ID，其次以 code 查询，再退回提示）
  async handleScan() {
    try {
      const res = await wx.scanCode({ scanType: ['qrCode'] });
      const raw = res?.result || '';

      // 1) 尝试直接从 URL 中提取产品批次ID：/product-batches/{id}
      const idMatch = raw.match(/\/product-batches\/(\d+)/);
      if (idMatch && idMatch[1]) {
        const id = Number(idMatch[1]);
        if (!isNaN(id)) {
          // 扫码进入详情：以只读模式展示
          wx.navigateTo({ url: `/pages/detail/detail?id=${id}&view=readonly` });
          return;
        }
      }

      // 2) 提取 code 参数或将整段内容视为 code，走后端扫描详情接口
      const extractCode = (str) => {
        try {
          // 兼容完整 URL
          const url = new URL(str);
          const codeParam = url.searchParams.get('code');
          if (codeParam) return codeParam;
          // 兼容路径段最后一节当作 code（若非数字ID）
          const last = url.pathname.split('/').filter(Boolean).pop();
          if (last && !/^\d+$/.test(last)) return last;
        } catch (_) {
          // 非 URL，直接返回原始字符串
        }
        return str;
      };

      const code = extractCode(raw);
      if (code && typeof code === 'string' && code.length > 0) {
        wx.showLoading({ title: '查询中...' });
        try {
          const detail = await qrcodeAPI.getTraceInfo(code);
          // detail 期望返回产品批次详情，取 id 跳转详情页
          const id = detail?.id || detail?.data?.id;
          if (id) {
            wx.hideLoading();
            // 扫码进入详情：以只读模式展示
            wx.navigateTo({ url: `/pages/detail/detail?id=${id}&view=readonly` });
            return;
          }
        } catch (e) {
          // 继续走失败提示
        }
        wx.hideLoading();
      }

      wx.showToast({ title: '无法解析二维码', icon: 'none' });
    } catch (error) {
      console.error('扫码失败:', error);
      wx.showToast({ title: '扫码失败', icon: 'none' });
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
