// 模拟数据配置
const mockData = {
  // 用户信息
  userInfo: {
    id: 1,
    username: '张三',
    tel: '13800138000',
    email: 'zhangsan@example.com',
    role: 'farmer',
    enterprise: '绿色农场合作社',
    avatar: '/images/default-product.jpg',
    createdAt: '2024-01-15T10:30:00Z'
  },

  // 企业信息
  enterprises: [
    {
      id: 1,
      name: '绿色农场合作社',
      address: '山东省寿光市蔬菜基地',
      contact: '李经理',
      phone: '0536-12345678',
      description: '专业从事有机蔬菜种植和销售'
    },
    {
      id: 2,
      name: '有机蔬菜种植基地',
      address: '河北省张家口市',
      contact: '王主任',
      phone: '0313-87654321',
      description: '专注于高品质有机蔬菜生产'
    }
  ],

  // 批次信息
  batches: [
    {
      id: 1,
      batchCode: 'BT202401001',
      productName: '有机白菜',
      quantity: 1000,
      unit: 'kg',
      plantingDate: '2024-01-15',
      harvestDate: '2024-03-15',
      status: 'harvested',
      createdAt: '2024-01-15T08:00:00Z'
    },
    {
      id: 2,
      batchCode: 'BT202401002',
      productName: '绿色菠菜',
      quantity: 500,
      unit: 'kg',
      plantingDate: '2024-01-20',
      harvestDate: '2024-03-20',
      status: 'harvested',
      createdAt: '2024-01-20T09:00:00Z'
    },
    {
      id: 3,
      batchCode: 'BT202402001',
      productName: '新鲜胡萝卜',
      quantity: 800,
      unit: 'kg',
      plantingDate: '2024-02-01',
      harvestDate: '2024-04-01',
      status: 'growing',
      createdAt: '2024-02-01T10:00:00Z'
    },
    {
      id: 4,
      batchCode: 'BT202402002',
      productName: '有机西红柿',
      quantity: 600,
      unit: 'kg',
      plantingDate: '2024-02-10',
      harvestDate: '2024-04-10',
      status: 'growing',
      createdAt: '2024-02-10T11:00:00Z'
    }
  ],

  // 产品信息
  products: [
    {
      id: 1,
      productId: 'P202401001', // 产品唯一ID
      name: '有机白菜',
      batch: {
        id: 1,
        batchCode: 'BT202401001'
      },
      origin: '山东省寿光市',
      producerName: '张三',
      producer: {
        id: 1,
        username: '张三',
        tel: '13800138000',
        enterprise: '绿色农场合作社'
      },
      quantity: 1000,
      unit: 'kg',
      plantingDate: '2024-01-15',
      harvestDate: '2024-03-15',
      testType: 'pesticide',
      testDate: '2024-03-16',
      isQualified: true,
      testResult: '合格',
      imageUrl: '/images/default-product.jpg',
      description: '采用有机种植方式，无农药残留，口感清甜',
      createdAt: '2024-03-16T14:30:00Z'
    },
    {
      id: 2,
      productId: 'P202401002', // 产品唯一ID
      name: '绿色菠菜',
      batch: {
        id: 2,
        batchCode: 'BT202401002'
      },
      origin: '山东省寿光市',
      producerName: '张三',
      producer: {
        id: 1,
        username: '张三',
        tel: '13800138000',
        enterprise: '绿色农场合作社'
      },
      quantity: 500,
      unit: 'kg',
      plantingDate: '2024-01-20',
      harvestDate: '2024-03-20',
      testType: 'nutrition',
      testDate: '2024-03-21',
      isQualified: true,
      testResult: '合格',
      imageUrl: '/images/default-product.jpg',
      description: '富含铁质和维生素，营养丰富',
      createdAt: '2024-03-21T15:00:00Z'
    },
    {
      id: 3,
      productId: 'P202402001', // 产品唯一ID
      name: '新鲜胡萝卜',
      batch: {
        id: 3,
        batchCode: 'BT202402001'
      },
      origin: '河北省张家口市',
      producerName: '李四',
      producer: {
        id: 2,
        username: '李四',
        tel: '13900139000',
        enterprise: '有机蔬菜种植基地'
      },
      quantity: 800,
      unit: 'kg',
      plantingDate: '2024-02-01',
      harvestDate: '2024-04-01',
      testType: 'heavy_metal',
      testDate: '2024-04-02',
      isQualified: true,
      testResult: '合格',
      imageUrl: '/images/default-product.jpg',
      description: '土壤肥沃，胡萝卜品质优良',
      createdAt: '2024-04-02T16:30:00Z'
    },
    {
      id: 4,
      productId: 'P202402002', // 产品唯一ID
      name: '有机西红柿',
      batch: {
        id: 4,
        batchCode: 'BT202402002'
      },
      origin: '河北省张家口市',
      producerName: '李四',
      producer: {
        id: 2,
        username: '李四',
        tel: '13900139000',
        enterprise: '有机蔬菜种植基地'
      },
      quantity: 600,
      unit: 'kg',
      plantingDate: '2024-02-10',
      harvestDate: '2024-04-10',
      testType: 'microorganism',
      testDate: '2024-04-11',
      isQualified: false,
      testResult: '不合格',
      imageUrl: '/images/default-product.jpg',
      description: '检测发现微生物超标，已下架处理',
      createdAt: '2024-04-11T17:00:00Z'
    },
    {
      id: 5,
      productId: 'P202403001', // 产品唯一ID
      name: '绿色生菜',
      batch: {
        id: 5,
        batchCode: 'BT202403001'
      },
      origin: '山东省寿光市',
      producerName: '张三',
      producer: {
        id: 1,
        username: '张三',
        tel: '13800138000',
        enterprise: '绿色农场合作社'
      },
      quantity: 300,
      unit: 'kg',
      plantingDate: '2024-03-01',
      harvestDate: '2024-05-01',
      testType: 'pesticide',
      testDate: '2024-05-02',
      isQualified: true,
      testResult: '合格',
      imageUrl: '/images/default-product.jpg',
      description: '新鲜采摘，口感脆嫩',
      createdAt: '2024-05-02T09:30:00Z'
    },
    {
      id: 6,
      productId: 'P202403002', // 产品唯一ID
      name: '有机黄瓜',
      batch: {
        id: 6,
        batchCode: 'BT202403002'
      },
      origin: '河北省张家口市',
      producerName: '李四',
      producer: {
        id: 2,
        username: '李四',
        tel: '13900139000',
        enterprise: '有机蔬菜种植基地'
      },
      quantity: 400,
      unit: 'kg',
      plantingDate: '2024-03-15',
      harvestDate: '2024-05-15',
      testType: 'nutrition',
      testDate: '2024-05-16',
      isQualified: true,
      testResult: '合格',
      imageUrl: '/images/default-product.jpg',
      description: '无农药种植，天然健康',
      createdAt: '2024-05-16T10:00:00Z'
    }
  ],

  // 二维码信息
  qrcodes: [
    {
      id: 1,
      qrcodeId: 'QR202401001',
      productId: 1,
      batchId: 1,
      generateTime: '2024-03-16T15:00:00Z',
      scanCount: 156,
      status: 'active',
      imageUrl: '/images/default-product.jpg'
    },
    {
      id: 2,
      qrcodeId: 'QR202401002',
      productId: 2,
      batchId: 2,
      generateTime: '2024-03-21T16:00:00Z',
      scanCount: 89,
      status: 'active',
      imageUrl: '/images/default-product.jpg'
    },
    {
      id: 3,
      qrcodeId: 'QR202402001',
      productId: 3,
      batchId: 3,
      generateTime: '2024-04-02T17:00:00Z',
      scanCount: 234,
      status: 'active',
      imageUrl: '/images/default-product.jpg'
    },
    {
      id: 4,
      qrcodeId: 'QR202402002',
      productId: 4,
      batchId: 4,
      generateTime: '2024-04-11T18:00:00Z',
      scanCount: 45,
      status: 'inactive',
      imageUrl: '/images/default-product.jpg'
    },
    {
      id: 5,
      qrcodeId: 'QR202403001',
      productId: 5,
      batchId: 5,
      generateTime: '2024-05-02T10:00:00Z',
      scanCount: 67,
      status: 'active',
      imageUrl: '/images/default-product.jpg'
    },
    {
      id: 6,
      qrcodeId: 'QR202403002',
      productId: 6,
      batchId: 6,
      generateTime: '2024-05-16T11:00:00Z',
      scanCount: 123,
      status: 'active',
      imageUrl: '/images/default-product.jpg'
    }
  ],

  // 溯源信息
  traceInfo: {
    product: {
      id: 1,
      name: '有机白菜',
      origin: '山东省寿光市',
      isQualified: true,
      producer: {
        id: 1,
        username: '张三',
        tel: '13800138000',
        enterprise: '绿色农场合作社'
      },
      plantingDate: '2024-01-15',
      harvestDate: '2024-03-15',
      testType: 'pesticide',
      testDate: '2024-03-16'
    },
    batch: {
      id: 1,
      batchCode: 'BT202401001',
      quantity: 1000,
      unit: 'kg'
    },
    qrcode: {
      qrcodeId: 'QR202401001',
      generateTime: '2024-03-16T15:00:00Z',
      scanCount: 156
    }
  },

  // 扫码结果
  scanResult: {
    success: true,
    data: {
      product: {
        id: 1,
        name: '有机白菜',
        origin: '山东省寿光市',
        isQualified: true,
        producer: {
          id: 1,
          username: '张三',
          tel: '13800138000',
          enterprise: '绿色农场合作社'
        },
        plantingDate: '2024-01-15',
        harvestDate: '2024-03-15',
        testType: 'pesticide',
        testDate: '2024-03-16'
      },
      batch: {
        id: 1,
        batchCode: 'BT202401001',
        quantity: 1000,
        unit: 'kg'
      },
      qrcode: {
        qrcodeId: 'QR202401001',
        generateTime: '2024-03-16T15:00:00Z',
        scanCount: 156
      }
    }
  }
};

// 模拟API响应延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟API类
class MockAPI {
  // 获取产品列表
  static async getProducts(params = {}) {
    await delay();
    let products = [...mockData.products];
    
    // 模拟筛选
    if (params.status === 'qualified') {
      products = products.filter(p => p.isQualified);
    } else if (params.status === 'unqualified') {
      products = products.filter(p => !p.isQualified);
    }
    
    // 模拟搜索
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(keyword) ||
        p.batch.batchCode.toLowerCase().includes(keyword)
      );
    }
    
    return products;
  }

  // 获取产品详情
  static async getProductDetail(id) {
    await delay();
    const product = mockData.products.find(p => p.id == id);
    if (!product) {
      throw new Error('产品不存在');
    }
    return product;
  }

  // 创建产品
  static async createProduct(data) {
    await delay();
    const newProduct = {
      id: mockData.products.length + 1,
      ...data,
      createdAt: new Date().toISOString()
    };
    mockData.products.push(newProduct);
    return newProduct;
  }

  // 获取我的产品
  static async getMyProducts() {
    await delay();
    // 模拟当前用户ID为1
    return mockData.products.filter(p => p.producer.id === 1);
  }

  // 获取二维码列表
  static async getQrcodes(params = {}) {
    await delay();
    let qrcodes = [...mockData.qrcodes];
    
    if (params.productId) {
      qrcodes = qrcodes.filter(q => q.productId == params.productId);
    }
    
    return qrcodes;
  }

  // 获取溯源信息
  static async getTraceInfo(qrcodeId) {
    await delay();
    const qrcode = mockData.qrcodes.find(q => q.qrcodeId === qrcodeId);
    if (!qrcode) {
      throw new Error('二维码不存在');
    }
    
    const product = mockData.products.find(p => p.id === qrcode.productId);
    const batch = mockData.batches.find(b => b.id === qrcode.batchId);
    
    return {
      product,
      batch,
      qrcode
    };
  }

  // 解析二维码数据
  static async decodeQrcodeData(data) {
    await delay();
    // 模拟解析二维码数据
    const qrcodeId = data.qrcodeData.split('/').pop();
    const traceInfo = await this.getTraceInfo(qrcodeId);
    
    return {
      success: true,
      data: traceInfo
    };
  }

  // 获取用户信息
  static async getUserInfo() {
    await delay();
    return mockData.userInfo;
  }

  // 用户登录
  static async login(data) {
    await delay();
    if (data.username === 'admin' && data.password === '123456') {
      return {
        token: 'mock-token-123456',
        user: mockData.userInfo
      };
    } else {
      throw new Error('用户名或密码错误');
    }
  }

  // 获取企业列表
  static async getEnterprises() {
    await delay();
    return mockData.enterprises;
  }

  // 获取批次列表
  static async getBatches(params = {}) {
    await delay();
    let batches = [...mockData.batches];
    
    if (params.status) {
      batches = batches.filter(b => b.status === params.status);
    }
    
    return batches;
  }
}

module.exports = {
  mockData,
  MockAPI,
  delay
}; 