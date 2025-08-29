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

// 认证相关API
export const authAPI = {
  // 登录
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  // 登出
  logout: () => {
    return api.post('/auth/logout');
  },

  // 获取当前用户信息
  getCurrentUser: () => {
    return api.get('/auth/me');
  },

  // 注册
  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  // 修改密码
  changePassword: (passwordData) => {
    return api.put('/auth/change-password', passwordData);
  },
};

export default api; 