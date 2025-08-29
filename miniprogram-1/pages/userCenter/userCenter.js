import { authAPI, enterpriseAPI, roleAPI, productAPI, qrcodeAPI } from '../../utils/api.js';

Page({
  data: {
    userInfo: null,
    isRegister: false,
    loginLoading: false,
    registerLoading: false,
    
    // 登录表单
    loginForm: {
      username: '',
      password: ''
    },
    
    // 注册表单
    registerForm: {
      username: '',
      password: '',
      confirmPassword: '',
      tel: '',
      roleId: 2, // 默认生产者
      enterpriseId: null,
      enterpriseName: ''
    },
    
    // 选择器数据
    roles: [],
    enterprises: [],
    roleIndex: 0,
    enterpriseIndex: 0,
    
    // 控制企业名称输入框显示
    showEnterpriseNameInput: false,
    
    // 统计数据
    stats: {
      productCount: 0,
      qrcodeCount: 0,
      scanCount: 0
    }
  },

  onLoad() {
    this.checkLoginStatus();
    this.loadRoles();
    this.loadEnterprises();
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

  // 加载角色列表
  async loadRoles() {
    try {
      const roles = await roleAPI.getRoles();
      this.setData({
        roles: roles
      });
    } catch (error) {
      console.error('加载角色失败:', error);
    }
  },

  // 加载企业列表
  async loadEnterprises() {
    try {
      let enterprises = await enterpriseAPI.getEnterprises();
      if (!Array.isArray(enterprises) || enterprises.length === 0) {
        enterprises = [];
      }
      // 始终追加“其他”选项
      const enterprisesWithOther = [
        ...enterprises,
        { id: -1, name: '其他' }
      ];
      this.setData({
        enterprises: enterprisesWithOther,
        // 默认选中第一个企业（如有），否则选中“其他”
        enterpriseIndex: enterprisesWithOther.length > 1 ? 0 : 0,
        'registerForm.enterpriseId': enterprisesWithOther.length > 1 ? enterprisesWithOther[0].id : null,
        showEnterpriseNameInput: enterprisesWithOther.length === 1 // 只有“其他”时自动显示输入框
      });
    } catch (error) {
      wx.showToast({
        title: '企业数据加载失败',
        icon: 'none'
      });
      // 兜底只显示“其他”
      this.setData({
        enterprises: [{ id: -1, name: '其他' }],
        enterpriseIndex: 0,
        'registerForm.enterpriseId': null,
        showEnterpriseNameInput: true
      });
    }
  },

  // 加载用户统计数据
  async loadUserStats() {
    try {
      const [products, qrcodes] = await Promise.all([
        productAPI.getMyProducts(),
        qrcodeAPI.getQrcodes()
      ]);
      
      const totalScans = qrcodes.reduce((sum, qrcode) => sum + qrcode.scanCount, 0);
      
      this.setData({
        stats: {
          productCount: products.length,
          qrcodeCount: qrcodes.length,
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

  // 角色选择
  onRoleChange(e) {
    const index = e.detail.value;
    const role = this.data.roles[index];
    
    this.setData({
      roleIndex: index,
      'registerForm.roleId': role.id
    });
  },

  // 企业选择
  onEnterpriseChange(e) {
    const index = e.detail.value;
    const enterprise = this.data.enterprises[index];
    
    this.setData({
      enterpriseIndex: index,
      'registerForm.enterpriseId': enterprise.id === -1 ? null : enterprise.id,
      'registerForm.enterpriseName': '',
      showEnterpriseNameInput: enterprise.id === -1
    });
  },

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
      
      const result = await authAPI.login({
        username,
        password
      });

      console.log('登录API响应:', result);

      // 兼容API返回结构
      const token = result.token || result.access_token;
      const user = result.user || result.data?.user || result.data;
      
      console.log('解析后的数据:', { token, user });
      
      if (!token || !user) {
        throw new Error('登录响应异常: token或user信息缺失');
      }
      
      wx.setStorageSync('token', token);
      wx.setStorageSync('userInfo', user);

      this.setData({
        userInfo: user,
        loginLoading: false
      });

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // 登录成功后强制刷新用户中心页面
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/userCenter/userCenter' });
      }, 500);

    } catch (error) {
      console.error('登录失败:', error);
      this.setData({ loginLoading: false });
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      });
    }
  },

  // 处理注册
  async handleRegister() {
    const { username, password, confirmPassword, tel, roleId, enterpriseId, enterpriseName } = this.data.registerForm;
    
    if (!username || !password || !confirmPassword || !tel) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次密码不一致',
        icon: 'none'
      });
      return;
    }

    // 验证企业选择
    if (enterpriseId === null && !enterpriseName) {
      wx.showToast({
        title: '请选择企业或输入企业名称',
        icon: 'none'
      });
      return;
    }

    this.setData({ registerLoading: true });

    try {
      const registerData = {
        username,
        password,
        tel,
        roleId,
        enterpriseId,
        enterpriseName
      };

      const result = await authAPI.register(registerData);
      this.setData({ registerLoading: false });

      wx.showToast({
        title: '注册成功，请登录',
        icon: 'success'
      });

      // 注册成功后强制刷新用户中心页面并自动切换到登录Tab
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/userCenter/userCenter' });
      }, 500);

    } catch (error) {
      this.setData({ registerLoading: false });
      wx.showToast({
        title: error.message || '注册失败',
        icon: 'none'
      });
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
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
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
});
