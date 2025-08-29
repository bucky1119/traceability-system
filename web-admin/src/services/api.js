import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加token
api.interceptors.request.use(
  (config) => {
    console.log('API请求:', config.method?.toUpperCase(), config.url, config.data);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => {
    console.log('API响应:', response.status, response.data);
    return response.data;
  },
  (error) => {
    console.error('API响应错误:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      // token过期，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 用户管理API
export const userAPI = {
  // 获取用户列表
  getUsers: (params) => api.get('/users', { params }),
  // 获取单个用户
  getUser: (id) => api.get(`/users/${id}`),
  // 创建用户
  createUser: (data) => api.post('/users', data),
  // 更新用户
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  // 删除用户
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// 企业管理API
export const enterpriseAPI = {
  // 获取企业列表
  getEnterprises: (params) => api.get('/enterprises', { params }),
  // 获取单个企业
  getEnterprise: (id) => api.get(`/enterprises/${id}`),
  // 创建企业
  createEnterprise: (data) => api.post('/enterprises', data),
  // 更新企业
  updateEnterprise: (id, data) => api.put(`/enterprises/${id}`, data),
  // 删除企业
  deleteEnterprise: (id) => api.delete(`/enterprises/${id}`),
};

// 产品管理API
export const productAPI = {
  // 获取产品列表
  getProducts: (params) => api.get('/products', { params }),
  // 获取单个产品
  getProduct: (id) => api.get(`/products/${id}`),
  // 创建产品
  createProduct: (data) => api.post('/products', data),
  // 更新产品
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  // 删除产品
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// 二维码管理API
export const qrcodeAPI = {
  // 获取二维码列表
  getQrcodes: (params) => api.get('/qrcodes', { params }),
  // 获取单个二维码
  getQrcode: (id) => api.get(`/qrcodes/${id}`),
  // 创建二维码
  createQrcode: (data) => api.post('/qrcodes', data),
  // 批量创建二维码
  batchCreateQrcodes: (data) => api.post('/qrcodes/batch', data),
  // 更新二维码
  updateQrcode: (id, data) => api.put(`/qrcodes/${id}`, data),
  // 删除二维码
  deleteQrcode: (id) => api.delete(`/qrcodes/${id}`),
  // 下载二维码
  downloadQrcode: (id) => api.get(`/qrcodes/${id}/download`),
};

// 统计API
export const statsAPI = {
  // 获取仪表盘统计
  getDashboardStats: () => api.get('/stats/dashboard'),
  // 获取用户统计
  getUserStats: () => api.get('/stats/users'),
  // 获取企业统计
  getEnterpriseStats: () => api.get('/stats/enterprises'),
  // 获取产品统计
  getProductStats: () => api.get('/stats/products'),
  // 获取二维码统计
  getQrcodeStats: () => api.get('/stats/qrcodes'),
};

export default api; 