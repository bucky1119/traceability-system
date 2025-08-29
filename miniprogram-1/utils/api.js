// API配置文件
const config = require('../config.js');
const { MockAPI } = require('./mockData.js');

// 是否使用模拟数据
const USE_MOCK_DATA = config.env === 'development' && config.useMockData;

// 请求封装
const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    // 如果使用模拟数据，直接返回模拟响应
    if (USE_MOCK_DATA) {
      // 模拟网络延迟
      setTimeout(() => {
        resolve({ success: true, data: {} });
      }, 500);
      return;
    }

    const token = wx.getStorageSync('token');
    
    wx.request({
      url: `${config.getBaseUrl()}${url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      timeout: config.getTimeout(),
      success: (res) => {
        console.log('API响应:', res.statusCode, res.data);
        // 优先判断success字段
        if (res.data && res.data.success) {
          resolve(res.data);
        } else if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          setTimeout(() => {
            wx.reLaunch({
              url: config.pages.userCenter
            });
          }, 1500);
          reject(res);
        } else {
          console.error('API错误:', res.statusCode, res.data);
          wx.showToast({
            title: Array.isArray(res.data.message) ? res.data.message[0] : (res.data.message || config.errorCodes.UNKNOWN_ERROR),
            icon: 'none'
          });
          reject(res);
        }
      },
      fail: (err) => {
        console.error('网络请求失败:', err);
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

// 认证相关API
export const authAPI = {
  // 用户登录
  login: async (data) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.login(data);
    }
    return request('/auth/login', {
      method: 'POST',
      data
    });
  },
  
  // 用户注册
  register: (data) => request('/auth/register', {
    method: 'POST',
    data
  }),
  
  // 获取用户信息
  getUserInfo: async () => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getUserInfo();
    }
    return request('/users/profile');
  }
};

// 产品相关API
export const productAPI = {
  // 获取产品列表（公共接口，无需登录）
  getProducts: async (params = {}) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getProducts(params);
    }
    return request('/products/public', {
      data: params
    });
  },
  
  // 获取产品列表（需要登录）
  getProductsWithAuth: async (params = {}) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getProducts(params);
    }
    return request('/products', {
      data: params
    });
  },
  
  // 创建产品
  createProduct: async (data) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.createProduct(data);
    }
    return request('/products', {
      method: 'POST',
      data
    });
  },
  
  // 管理员录入产品
  createProductByAdmin: (data) => request('/products/admin', {
    method: 'POST',
    data
  }),
  
  // 获取产品详情
  getProductDetail: async (id) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getProductDetail(id);
    }
    return request(`/products/${id}`);
  },
  
  // 更新产品信息
  updateProduct: (id, data) => request(`/products/${id}`, {
    method: 'PATCH',
    data
  }),
  
  // 删除产品
  deleteProduct: (id) => request(`/products/${id}`, {
    method: 'DELETE'
  }),
  
  // 获取我的产品列表
  getMyProducts: async () => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getMyProducts();
    }
    return request('/products/my');
  },
  
  // 导出检测结果
  exportTestResults: (farmerId) => request(`/products/export${farmerId ? `?farmerId=${farmerId}` : ''}`)
};

// 二维码相关API
export const qrcodeAPI = {
  // 创建二维码
  createQrcode: (data) => request('/qrcodes', {
    method: 'POST',
    data
  }),
  
  // 获取二维码列表
  getQrcodes: async (params = {}) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getQrcodes(params);
    }
    return request('/qrcodes', {
      data: params
    });
  },
  
  // 获取二维码详情
  getQrcodeDetail: (id) => request(`/qrcodes/${id}`),
  
  // 获取二维码图片信息
  getQrcodeImageInfo: (qrcodeId) => request(`/qrcodes/image-info/${qrcodeId}`),
  
  // // 下载二维码图片
  // downloadQrcodeImage: (qrcodeId) => request(`/qrcodes/download/${qrcodeId}`),
  
  // // 预览二维码图片
  // previewQrcodeImage: (qrcodeId) => request(`/qrcodes/preview/${qrcodeId}`),
  // 下载二维码图片
  downloadQrcodeImage: (qrcodeId) => {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token');
      wx.downloadFile({
        url: `${config.getBaseUrl()}/qrcodes/download/${qrcodeId}`,
        header: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.tempFilePath); // 返回临时文件路径
          } else {
            console.error('下载失败:', res);
            reject(new Error('下载失败'));
          }
        },
        fail: (err) => {
          console.error('下载请求失败:', err);
          reject(err);
        }
      });
    });
  },

  // 预览二维码图片
  previewQrcodeImage: (qrcodeId) => {
    const token = wx.getStorageSync('token');
    return `${config.getBaseUrl()}/qrcodes/preview/${qrcodeId}?token=${token}`;
  },
  
  // 查询溯源信息
  getTraceInfo: async (qrcodeId) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getTraceInfo(qrcodeId);
    }
    return request(`/qrcodes/trace/${qrcodeId}`);
  },
  
  // 解析二维码数据
  decodeQrcodeData: async (data) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.decodeQrcodeData(data);
    }
    return request('/qrcodes/decode', {
      method: 'POST',
      data
    });
  }
};

// 批次相关API
export const batchAPI = {
  // 获取批次列表
  getBatches: async (params = {}) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getBatches(params);
    }
    return request('/batches', {
      data: params
    });
  },
  
  // 创建批次
  createBatch: (data) => request('/batches', {
    method: 'POST',
    data
  }),
  
  // 获取批次详情
  getBatchDetail: (id) => request(`/batches/${id}`),
  
  // 更新批次信息
  updateBatch: (id, data) => request(`/batches/${id}`, {
    method: 'PATCH',
    data
  })
};

// 企业相关API
export const enterpriseAPI = {
  // 获取企业列表（公共接口，无需登录）
  getEnterprises: async () => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getEnterprises();
    }
    return request('/enterprises/public');
  },
  
  // 获取企业列表（需要登录）
  getEnterprisesWithAuth: async () => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getEnterprises();
    }
    return request('/enterprises');
  },
  
  // 创建企业
  createEnterprise: (data) => request('/enterprises', {
    method: 'POST',
    data
  }),
  
  // 获取企业详情
  getEnterpriseDetail: (id) => request(`/enterprises/${id}`),
  
  // 更新企业信息
  updateEnterprise: (id, data) => request(`/enterprises/${id}`, {
    method: 'PATCH',
    data
  }),
  
  // 删除企业
  deleteEnterprise: (id) => request(`/enterprises/${id}`, {
    method: 'DELETE'
  })
};

// 角色相关API
export const roleAPI = {
  // 获取角色列表
  getRoles: () => request('/roles')
};

// 管理员相关API
export const adminAPI = {
  // 获取农户列表
  getFarmers: async () => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getFarmers();
    }
    return request('/admin/farmers');
  },
  
  // 为农户录入产品
  createFarmerProduct: (data) => request('/admin/products', {
    method: 'POST',
    data
  }),
  
  // 导出产品信息
  exportProducts: (params = {}) => request(`/admin/products/export${params.farmerId ? `?farmerId=${params.farmerId}` : ''}`),
  
  // 获取系统统计
  getSystemStats: async () => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getSystemStats();
    }
    return request('/admin/stats');
  },
  
  // 获取产品统计
  getProductStats: async () => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getProductStats();
    }
    return request('/admin/products/stats');
  },
  
  // 获取企业统计
  getEnterpriseStats: async () => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getEnterpriseStats();
    }
    return request('/admin/enterprises');
  },
  
  // 获取二维码统计
  getQrcodeStats: async () => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getQrcodeStats();
    }
    return request('/admin/qrcodes/stats');
  },
  
  // 获取指定农户的产品
  getFarmerProducts: (farmerId) => request(`/admin/farmers/${farmerId}/products`)
};

// 工具方法
export const utils = {
  // 格式化日期
  formatDate: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },
  
  // 格式化日期时间
  formatDateTime: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },
  
  // 文件大小格式化
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  // 验证手机号
  validatePhone: (phone) => {
    const reg = /^1[3-9]\d{9}$/;
    return reg.test(phone);
  },
  
  // 验证邮箱
  validateEmail: (email) => {
    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return reg.test(email);
  }
};

export default {
  request,
  authAPI,
  productAPI,
  qrcodeAPI,
  batchAPI,
  enterpriseAPI,
  roleAPI,
  utils
}; 