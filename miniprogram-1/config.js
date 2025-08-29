// 配置文件
const config = {
  // API配置
  api: {
    // 开发环境
    development: {
      baseUrl: 'http://localhost:3000/api',
      timeout: 10000
    },
    // 测试环境
    test: {
      baseUrl: 'https://test-api.example.com/api',
      timeout: 10000
    },
    // 生产环境
    production: {
      baseUrl: 'https://api.example.com/api',
      timeout: 10000
    }
  },

  // 当前环境
  env: 'development', // development, test, production

  // 是否使用模拟数据（开发环境可用）
  // useMockData: true,
  useMockData: false,

  // 获取当前环境的API配置
  getApiConfig() {
    return this.api[this.env];
  },

  // 获取API基础URL
  getBaseUrl() {
    return this.getApiConfig().baseUrl;
  },

  // 获取请求超时时间
  getTimeout() {
    return this.getApiConfig().timeout;
  },

  // 小程序配置
  app: {
    name: '蔬菜溯源系统',
    version: '1.0.0',
    description: '基于微信小程序的蔬菜溯源系统'
  },

  // 页面配置
  pages: {
    index: '/pages/index/index',
    detail: '/pages/detail/detail',
    input: '/pages/input/input',
    myVegetables: '/pages/myVegetables/myVegetables',
    userCenter: '/pages/userCenter/userCenter'
  },

  // 图片配置
  images: {
    defaultProduct: '/images/default-product.jpg',
    home: '/images/home.png',
    homeActive: '/images/home-active.png',
    add: '/images/add.png',
    addActive: '/images/add-active.png',
    my: '/images/my.png',
    myActive: '/images/my-active.png',
    user: '/images/user.png',
    userActive: '/images/user-active.png'
  },

  // 状态配置
  status: {
    qualified: {
      label: '合格',
      value: true,
      color: '#52c41a'
    },
    unqualified: {
      label: '不合格',
      value: false,
      color: '#ff4d4f'
    }
  },

  // 检测类型配置
  testTypes: [
    { label: '农药残留检测', value: 'pesticide' },
    { label: '重金属检测', value: 'heavy_metal' },
    { label: '微生物检测', value: 'microorganism' },
    { label: '营养成分检测', value: 'nutrition' },
    { label: '产品成分检测', value: 'ingredient' },
    { label: '其他检测', value: 'other' }
  ],

  // 角色配置
  roles: [
    { label: '农户', value: 'farmer' },
    { label: '合作社', value: 'cooperative' },
    { label: '企业', value: 'enterprise' },
    { label: '消费者', value: 'consumer' }
  ],

  // 文件上传配置
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    quality: 0.8
  },

  // 二维码配置
  qrcode: {
    size: 300,
    margin: 10,
    color: '#000000',
    backgroundColor: '#ffffff'
  },

  // 缓存配置
  cache: {
    // 缓存过期时间（毫秒）
    expireTime: {
      userInfo: 24 * 60 * 60 * 1000, // 24小时
      products: 5 * 60 * 1000, // 5分钟
      qrcodes: 10 * 60 * 1000 // 10分钟
    }
  },

  // 错误码配置
  errorCodes: {
    NETWORK_ERROR: '网络连接失败',
    AUTH_ERROR: '认证失败',
    PARAM_ERROR: '参数错误',
    SERVER_ERROR: '服务器错误',
    UNKNOWN_ERROR: '未知错误'
  },

  // 正则表达式配置
  regex: {
    phone: /^1[3-9]\d{9}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    batchCode: /^[A-Z0-9]{8,20}$/
  },

  // 验证规则配置
  validation: {
    productName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      message: '产品名称长度为2-50个字符'
    },
    batchCode: {
      required: true,
      pattern: /^[A-Z0-9]{8,20}$/,
      message: '批次编号为8-20位大写字母和数字组合'
    },
    phone: {
      required: true,
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码'
    },
    email: {
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: '请输入正确的邮箱地址'
    }
  },

  // 主题色彩配置
  theme: {
    primary: '#667eea',
    primaryLight: '#7c8fff',
    primaryDark: '#5a6fd8',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    textPrimary: '#333333',
    textSecondary: '#666666',
    textDisabled: '#999999',
    border: '#e8e8e8',
    background: '#f5f5f5',
    cardBackground: '#ffffff'
  }
};

// 导出配置
module.exports = config; 