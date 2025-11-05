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

// 农户（生产者）管理API
export const producerAPI = {
  getProducers: (params) => api.get('/producers', { params }),
  getProducer: (id) => api.get(`/producers/${id}`),
  createProducer: (data) => api.post('/producers', data),
  updateProducer: (id, data) => api.patch(`/producers/${id}`, data),
  // 如需要删除可补充对应后端接口
};

// 管理员管理API
export const adminAPI = {
  getAdmins: () => api.get('/admins'),
  createAdmin: (data) => api.post('/admins', data),
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

// 产品批次管理API（与后端 product-batches 对齐）
export const productBatchAPI = {
  getBatches: (params) => api.get('/product-batches', { params }),
  getBatch: (id) => api.get(`/product-batches/${id}`),
  createBatch: (data) => api.post('/product-batches', data),
  updateBatch: (id, data) => api.patch(`/product-batches/${id}`, data),
  deleteBatch: (id) => api.delete(`/product-batches/${id}`),
  exportCsv: (producerId) => api.get('/product-batches/export', { params: producerId ? { producerId } : {}, responseType: 'blob' }),
};

// 二维码管理API（与后端 qr-codes 路由对齐）
export const qrcodeAPI = {
  // 获取二维码列表
  getQrcodes: (params) => api.get('/qr-codes', { params }),
  // 获取单个二维码
  getQrcode: (id) => api.get(`/qr-codes/${id}`),
  // 创建二维码
  createQrcode: (data) => api.post('/qr-codes', data),
  // 批量创建二维码
  batchCreateQrcodes: (data) => api.post('/qr-codes/batch', data),
  // 更新二维码
  updateQrcode: (id, data) => api.put(`/qr-codes/${id}`, data),
  // 删除二维码
  deleteQrcode: (id) => api.delete(`/qr-codes/${id}`),
  // 下载二维码
  downloadQrcode: (id) => api.get(`/qr-codes/${id}/download`),
};

// 统计API
export const statsAPI = {
  // 仪表盘统计（后端提供 /stats/dashboard）
  getDashboardStats: () => api.get('/stats/dashboard'),
};

export default api; 