import { authAPI, productAPI, qrcodeAPI, producerAPI, utils } from '../../utils/api.js';

Page({
  data: {
    userInfo: null,
    isRegister: false,
    isAdminLogin: false,
    loginLoading: false,
    registerLoading: false,
    
    // 登录表单
    loginForm: {
      username: '',
      password: ''
    },
    
    // 注册表单（生产者注册）
    registerForm: {
      account: '',
      name: '',
      password: '',
      confirmPassword: '',
      registrationCode: ''
    },
    
  // 选择器数据（旧：角色/企业，已移除）

    // 统计数据
    stats: {
      productCount: 0,
      qrcodeCount: 0,
      scanCount: 0
    },

    // 个人信息编辑
    showProfileModal: false,
    profileForm: {
      name: '',
      phone: ''
    },
    savingProfile: false
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    // 每次页面显示都强制从本地存储同步userInfo，确保登录/注册后立即生效
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
      this.loadUserStats();
    } else {
      this.setData({ userInfo: null });
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.setData({
        userInfo: userInfo
      });
    }
  },

  // 角色/企业数据加载已移除（后端未提供相关接口）

  // 加载用户统计数据
  async loadUserStats() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      const isProducer = !!(userInfo && userInfo.role === 'producer');

      // 生产者：调用 /product-batches/my；管理员：调用受保护的全量列表
      const products = isProducer
        ? await productAPI.getMyProducts()
        : await productAPI.getProductsWithAuth();

      const list = Array.isArray(products) ? products : [];
  const qrcodeCount = list.reduce((sum, b) => sum + (Array.isArray(b.qrCodes) ? b.qrCodes.length : 0), 0);
      const totalScans = 0; // 后端暂未提供扫码统计
      
      this.setData({
        stats: {
          productCount: list.length,
          qrcodeCount: qrcodeCount,
          scanCount: totalScans
        }
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  },

  // 登录输入处理
  onLoginInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`loginForm.${field}`]: value
    });
  },

  // 注册输入处理
  onRegisterInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`registerForm.${field}`]: value
    });
  },

  // 角色/企业选择已移除

  // 切换到注册
  switchToRegister() {
    this.setData({
      isRegister: true
    });
  },

  // 切换到登录
  switchToLogin() {
    this.setData({
      isRegister: false
    });
  },

  // 处理登录
  async handleLogin() {
    const { username, password } = this.data.loginForm;
    
    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }

    this.setData({ loginLoading: true });

    try {
      console.log('开始登录:', { username, password });
      const isAdmin = this.data.isAdminLogin;
      const result = isAdmin
        ? await authAPI.adminLogin({ username, password })
        : await authAPI.login({ username, password });

      console.log('登录API响应:', result);

      // 兼容API返回结构：优先取 access_token。若无 user，则从 JWT 中解码出基础信息
      const token = (result && (result.token || result.access_token)) || null;
      let user = (result && (result.user || (result.data && (result.data.user || result.data)))) || null;
      if (!user && token) {
        const payload = utils.decodeJwt(token);
        if (payload) {
          user = {
            id: payload.sub,
            role: payload.role,
            username: payload.username || payload.name || this.data.loginForm.username,
          };
        }
      }
      if (!user) {
        // 最低保障：构造一个基础用户对象，避免界面无法识别登录态
        user = {
          username,
          role: isAdmin ? 'admin' : 'producer',
        };
      }
      
      console.log('解析后的数据:', { token, user });
      
      if (!token) {
        throw new Error('登录响应异常: 未获取到 token');
      }
      
      wx.setStorageSync('token', token);
      // 若是管理员登录，确保角色标记
      if (this.data.isAdminLogin) {
        if (!user) user = {};
        user.role = 'admin';
      }
      if (!this.data.isAdminLogin) {
        if (user && !user.role) {
          user.role = 'producer';
        }
      }
      if (user) {
        wx.setStorageSync('userInfo', user);
      }

      this.setData({
        userInfo: user,
        loginLoading: false
      });

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // 已在当前页，直接刷新统计与视图即可
      this.loadUserStats();

    } catch (error) {
      console.error('登录失败:', error);
      this.setData({ loginLoading: false });
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      });
    }
  },

  // 管理员登录开关
  onAdminLoginSwitch(e) {
    this.setData({ isAdminLogin: !!e.detail.value });
  },

  // 处理注册
  async handleRegister() {
    const { account, name, password, confirmPassword, registrationCode } = this.data.registerForm;

    if (!account || !name || !password || !confirmPassword || !registrationCode) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    if (password !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }

    this.setData({ registerLoading: true });
    try {
      const payload = { account, password, name, registrationCode };
      await authAPI.register(payload);
      this.setData({ registerLoading: false, isRegister: false });
      wx.showToast({ title: '注册成功，请登录', icon: 'success' });
    } catch (error) {
      this.setData({ registerLoading: false });
      wx.showToast({ title: error.message || '注册失败', icon: 'none' });
    }
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          
          this.setData({
            userInfo: null
          });

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 跳转到我的产品
  goToMyProducts() {
    wx.switchTab({
      url: '/pages/myVegetables/myVegetables'
    });
  },

  // 跳转到录入页面
  goToInput() {
    wx.switchTab({
      url: '/pages/input/input'
    });
  },

  // 跳转到二维码管理
  goToQrcodeManagement() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 跳转到个人信息
  goToProfile() {
    const userInfo = this.data.userInfo;
    if (!userInfo || userInfo.role !== 'producer') {
      wx.showToast({ title: '仅生产者可编辑', icon: 'none' });
      return;
    }
    // 拉取本人资料
    wx.showLoading({ title: '加载中...' });
    producerAPI.getMe()
      .then((me) => {
        wx.hideLoading();
        this.setData({
          showProfileModal: true,
          profileForm: {
            name: me?.name || userInfo.username || '',
            phone: me?.phone || ''
          }
        });
      })
      .catch(() => {
        wx.hideLoading();
        // fallback 使用现有信息
        this.setData({
          showProfileModal: true,
          profileForm: {
            name: userInfo.username || '',
            phone: ''
          }
        });
      });
  },
  

  onProfileInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({ [`profileForm.${field}`]: value });
  },

  closeProfileModal() {
    this.setData({ showProfileModal: false });
  },

  async saveProfile() {
    if (this.savingProfile) return;
    const { name, phone } = this.data.profileForm;
    if (!name || !name.trim()) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return;
    }
    if (phone && !utils.validatePhone(phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      return;
    }
    this.savingProfile = true;
    wx.showLoading({ title: '保存中...' });
    try {
      await producerAPI.updateMe({ name: name.trim(), phone: phone || undefined });
      wx.hideLoading();
      wx.showToast({ title: '已保存', icon: 'success' });
      // 同步本地 userInfo 展示名
      const userInfo = wx.getStorageSync('userInfo') || {};
      userInfo.username = name.trim();
      wx.setStorageSync('userInfo', userInfo);
      this.setData({ userInfo, showProfileModal: false });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
    this.savingProfile = false;
  },

  // 管理员功能 - 农户产品录入
  goToFarmerInput() {
    if (this.data.userInfo.role !== 'admin') {
      wx.showToast({
        title: '权限不足',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/admin/farmerInput/farmerInput'
    });
  },

  // 管理员功能 - 产品信息导出
  goToProductExport() {
    if (this.data.userInfo.role !== 'admin') {
      wx.showToast({
        title: '权限不足',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/admin/productExport/productExport'
    });
  },

  // 管理员功能 - 农户管理
  goToFarmerManagement() {
    if (this.data.userInfo.role !== 'admin') {
      wx.showToast({
        title: '权限不足',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/admin/farmerManagement/farmerManagement'
    });
  },

  // 管理员功能 - 系统统计
  goToSystemStats() {
    if (this.data.userInfo.role !== 'admin') {
      wx.showToast({
        title: '权限不足',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/admin/systemStats/systemStats'
    });
  }
  ,

  // 管理员功能 - 创建管理员
  goToAdminCreate() {
    if (this.data.userInfo.role !== 'admin') {
      wx.showToast({ title: '权限不足', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/admin/adminCreate/adminCreate' });
  },

  // 管理员功能 - 设置注册码
  goToRegistrationCode() {
    if (this.data.userInfo.role !== 'admin') {
      wx.showToast({ title: '权限不足', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/admin/registrationCode/registrationCode' });
  }
});
