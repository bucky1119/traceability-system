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
    // 后端已改为生产者账号登录：/auth/producer/login，字段为 { account, password }
    const payload = {
      account: data.account || data.username, // 兼容旧表单的 username 字段
      password: data.password,
    };
    return request('/auth/producer/login', {
      method: 'POST',
      data: payload
    });
  },
  
  // 管理员登录
  adminLogin: async (data) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.login(data);
    }
    const payload = {
      username: data.username,
      password: data.password,
    };
    return request('/auth/admin/login', {
      method: 'POST',
      data: payload,
    });
  },
  
  // 生产者注册（/producers/register）
  register: (data) => {
    const payload = {
      account: data.account || data.username,
      password: data.password,
      name: data.name || data.username,
      registrationCode: data.registrationCode,
    };
    return request('/producers/register', { method: 'POST', data: payload });
  },
  
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
    // 统一使用 /product-batches
    return request('/product-batches', {
      data: params
    });
  },
  
  // 获取产品列表（需要登录）
  getProductsWithAuth: async (params = {}) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getProducts(params);
    }
    return request('/product-batches', {
      data: params
    });
  },
  
  // 创建产品
  createProduct: async (data) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.createProduct(data);
    }
    return request('/product-batches', {
      method: 'POST',
      data
    });
  },
  
  // 创建产品（带图片，字段名 image）
  createProductWithImage: ({ data, filePath }) => new Promise((resolve, reject) => {
    if (USE_MOCK_DATA) {
      MockAPI.createProduct(data).then(resolve).catch(reject);
      return;
    }
    const token = wx.getStorageSync('token');
    // 仅上传有值的字段，强制转为字符串，避免 [object Undefined]
    const formData = {};
    const isISODateTime = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(s);
    Object.keys(data || {}).forEach((k) => {
      const v = data[k];
      if (v !== undefined && v !== null && v !== '') {
        const s = String(v);
        // ISO 日期保持原样（避免被 % 编码后后端校验失败），其他字段做 URI 编码
        formData[k] = isISODateTime(s) ? s : encodeURIComponent(s);
      }
    });
    wx.uploadFile({
      url: `${config.getBaseUrl()}/product-batches`,
      filePath,
      name: 'image',
      formData,
      header: { Authorization: token ? `Bearer ${token}` : '' },
      success: (res) => {
        try { resolve(JSON.parse(res.data)); } catch { resolve(res.data); }
      },
      fail: reject,
    });
  }),
  
  // 管理员录入产品
  // 管理员录入产品（需在 data 中提供 producerId）
  createProductByAdmin: (data) => request('/product-batches', {
    method: 'POST',
    data
  }),
  
  // 获取产品详情
  getProductDetail: async (id) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getProductDetail(id);
    }
    return request(`/product-batches/${id}`);
  },
  
  // 更新产品信息
  updateProduct: (id, data) => request(`/product-batches/${id}`, {
    method: 'PATCH',
    data
  }),

  // 更新产品图片（POST /product-batches/:id/image，字段名 image）
  updateProductImage: ({ id, filePath }) => new Promise((resolve, reject) => {
    if (USE_MOCK_DATA) {
      resolve({ success: true });
      return;
    }
    const token = wx.getStorageSync('token');
    wx.uploadFile({
      url: `${config.getBaseUrl()}/product-batches/${id}/image`,
      filePath,
      name: 'image',
      header: { Authorization: token ? `Bearer ${token}` : '' },
      success: (res) => { try { resolve(JSON.parse(res.data)); } catch { resolve(res.data); } },
      fail: reject,
    });
  }),
  
  // 删除产品
  deleteProduct: (id) => request(`/product-batches/${id}`, {
    method: 'DELETE'
  }),
  
  // 获取我的产品列表
  getMyProducts: async () => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getMyProducts();
    }
    // 使用受保护的 "我的产品" 列表，仅返回当前登录生产者的产品
    return request('/product-batches/my');
  },
  
  // 导出检测结果
  // 导出产品为 CSV（管理员可用 producerId 过滤）
  exportTestResults: (producerId) => request(`/product-batches/export${producerId ? `?producerId=${producerId}` : ''}`)
};

// 二维码相关API
export const qrcodeAPI = {
  // 为批次生成二维码（需要传入 batchId）
  createQrcode: (batchId) => request(`/qr-codes/generate/${batchId}`, {
    method: 'POST'
  }),
  
  // 获取二维码列表
  getQrcodes: async (params = {}) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getQrcodes(params);
    }
    // 后端暂无列表接口，先返回空数组避免 404
    return [];
  },
  
  // 获取二维码详情
  // 通过 code 查询批次详情
  getQrcodeDetail: (code) => request(`/qr-codes/scan/detail`, { data: { code } }),
  
  // 获取二维码图片信息
  // 直接返回图片 URL（无需鉴权）
  getQrcodeImageInfo: (code) => ({
    imageUrl: `${config.getBaseUrl()}/qr-codes/image/${code}`
  }),
  
  // // 下载二维码图片
  // downloadQrcodeImage: (qrcodeId) => request(`/qrcodes/download/${qrcodeId}`),
  
  // // 预览二维码图片
  // previewQrcodeImage: (qrcodeId) => request(`/qrcodes/preview/${qrcodeId}`),
  // 下载二维码图片
  downloadQrcodeImage: (code) => {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token');
      wx.downloadFile({
        url: `${config.getBaseUrl()}/qr-codes/download/${code}`,
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
  previewQrcodeImage: (code) => {
    return `${config.getBaseUrl()}/qr-codes/image/${code}`;
  },
  
  // 查询溯源信息
  getTraceInfo: async (code) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getTraceInfo(code);
    }
    return request(`/qr-codes/scan/detail?code=${encodeURIComponent(code)}`);
  },
  
  // 解析二维码数据
  decodeQrcodeData: async (data) => {
    // 保留占位；当前后端未提供该接口
    if (USE_MOCK_DATA) {
      return await MockAPI.decodeQrcodeData(data);
    }
    return { success: true, data: {} };
  }
};

// 批次相关API
export const batchAPI = {
  // 获取批次列表
  getBatches: async (params = {}) => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getBatches(params);
    }
    return request('/product-batches', {
      data: params
    });
  },
  
  // 创建批次
  createBatch: (data) => request('/product-batches', {
    method: 'POST',
    data
  }),
  
  // 获取批次详情
  getBatchDetail: (id) => request(`/product-batches/${id}`),
  
  // 更新批次信息
  updateBatch: (id, data) => request(`/product-batches/${id}`, {
    method: 'PATCH',
    data
  })
};


// 角色相关API
// 已移除 roleAPI（后端无 /roles 接口）

// 管理员相关API
export const adminAPI = {
  // 获取农户列表
  getFarmers: async () => {
    if (USE_MOCK_DATA) {
      return await MockAPI.getFarmers();
    }
    return request('/producers');
  },
  // 创建管理员
  createAdmin: (data) => request('/admins', { method: 'POST', data }),
  
  // 为农户录入产品
  createFarmerProduct: (data) => request('/product-batches', {
    method: 'POST',
    data
  }),
  
  // 导出产品信息
  exportProducts: (params = {}) => request(`/product-batches/export${params.producerId ? `?producerId=${params.producerId}` : ''}`),

  // 下载产品导出（CSV），返回临时文件路径
  downloadProductsCsv: ({ producerId } = {}) => new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    const url = `${config.getBaseUrl()}/product-batches/export${producerId ? `?producerId=${producerId}` : ''}`;
    wx.downloadFile({
      url,
      header: { Authorization: token ? `Bearer ${token}` : '' },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath);
        } else {
          reject(new Error('下载失败'));
        }
      },
      fail: reject,
    });
  }),

  // 设置注册码
  setRegistrationCode: ({ code }) => request('/system-config/registration-code', {
    method: 'PUT',
    data: { code }
  }),
};

// 统计 API（管理员）
export const statsAPI = {
  getDashboard: () => request('/stats/dashboard'),
};

// 安检相关API
export const safetyAPI = {
  // 创建安检（JSON，不带图片）
  create: (data) => request('/safety-inspections', { method: 'POST', data }),
  // 创建安检（带图片，字段名 resultImage）
  createWithImage: ({ data, filePath }) => new Promise((resolve, reject) => {
    if (USE_MOCK_DATA) {
      MockAPI.createSafety && MockAPI.createSafety(data).then(resolve).catch(reject);
      return;
    }
    const token = wx.getStorageSync('token');
    const formData = {};
    const isISODateTime = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(s);
    Object.keys(data || {}).forEach((k) => {
      const v = data[k];
      if (v !== undefined && v !== null && v !== '') {
        const s = String(v);
        formData[k] = isISODateTime(s) ? s : encodeURIComponent(s);
      }
    });
    wx.uploadFile({
      url: `${config.getBaseUrl()}/safety-inspections`,
      filePath,
      name: 'resultImage',
      formData,
      header: { Authorization: token ? `Bearer ${token}` : '' },
      success: (res) => {
        try { resolve(JSON.parse(res.data)); } catch { resolve(res.data); }
      },
      fail: reject,
    });
  }),
  // 更新安检（JSON，不带图片）
  update: (id, data) => {
    // 防御性：移除不应出现在更新请求中的字段
    const { batchId, creatorId, resultImageUrl, ...rest } = data || {};
    return request(`/safety-inspections/${id}`, { method: 'PATCH', data: rest });
  },
  // 删除安检
  remove: (id) => request(`/safety-inspections/${id}`, { method: 'DELETE' }),
  // 按批次查询
  listByBatch: (batchId) => request(`/safety-inspections/batch/${batchId}`),
  // 上传安检图片
  uploadResultImage: ({ id, filePath }) => new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    wx.uploadFile({
      url: `${config.getBaseUrl()}/safety-inspections/${id}`,
      filePath,
      name: 'resultImage',
      header: { Authorization: token ? `Bearer ${token}` : '' },
      success: (res) => {
        try { resolve(JSON.parse(res.data)); } catch { resolve(res.data); }
      },
      fail: reject,
    });
  }),

  // 更新已有安检图片（POST /safety-inspections/:id/image）
  updateImage: ({ id, filePath, data = {} }) => new Promise((resolve, reject) => {
    if (USE_MOCK_DATA) {
      resolve({ success: true });
      return;
    }
    const token = wx.getStorageSync('token');
    wx.uploadFile({
      url: `${config.getBaseUrl()}/safety-inspections/${id}/image`,
      filePath,
      name: 'resultImage',
      formData: data,
      header: { Authorization: token ? `Bearer ${token}` : '' },
      success: (res) => { try { resolve(JSON.parse(res.data)); } catch { resolve(res.data); } },
      fail: reject,
    });
  }),
};

// 生产者个人信息 API
export const producerAPI = {
  // 获取当前登录生产者信息（基于 token 中的 sub）
  getMe: async () => {
    if (USE_MOCK_DATA) {
      return { id: 1, name: '测试用户', phone: '13800000000' };
    }
    const token = wx.getStorageSync('token');
    const payload = token ? utils.decodeJwt(token) : null;
    const id = payload?.sub;
    if (!id) throw new Error('未获取到用户ID');
    return request(`/producers/${id}`);
  },

  // 更新当前登录生产者信息（姓名、联系方式）
  updateMe: async (data) => {
    if (USE_MOCK_DATA) {
      return { success: true };
    }
    return request('/producers/me', { method: 'PATCH', data });
  }
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
  },

  // 解析 JWT（不验证，仅解码 payload）
  decodeJwt: (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (payload.length % 4) payload += '=';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let output = '';
      let buffer = 0;
      let bc = 0;
      for (let i = 0; i < payload.length; i++) {
        const c = chars.indexOf(payload.charAt(i));
        if (c < 0) continue;
        buffer = (buffer << 6) | c;
        bc += 6;
        if (bc >= 8) {
          bc -= 8;
          output += String.fromCharCode((buffer >>> bc) & 0xff);
        }
      }
      let jsonStr;
      try {
        // 尝试按 UTF-8 解码
        // 使用 escape 以兼容性处理（虽已废弃，但在小程序运行时可用）
        // eslint-disable-next-line deprecate/deprecate
        jsonStr = decodeURIComponent(escape(output));
      } catch (_) {
        jsonStr = output;
      }
      return JSON.parse(jsonStr);
    } catch (e) {
      console.warn('JWT 解码失败:', e);
      return null;
    }
  }
};

export default {
  request,
  authAPI,
  productAPI,
  qrcodeAPI,
  safetyAPI,
  batchAPI,
  producerAPI,
  statsAPI,
  utils
}; 