// app.js
App({
  globalData: {
    userInfo: null,
    token: null,
    systemInfo: null,
    networkType: 'wifi',
    isLoggedIn: false
  },

  onLaunch() {
    // 小程序启动时执行
    console.log('小程序启动');
    
    // 获取系统信息
    this.getSystemInfo();
    
    // 获取网络状态
    this.getNetworkType();
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 监听网络状态变化
    this.watchNetworkStatus();
  },

  onShow() {
    // 小程序显示时执行
    console.log('小程序显示');
  },

  onHide() {
    // 小程序隐藏时执行
    console.log('小程序隐藏');
  },

  onError(msg) {
    // 小程序发生错误时执行
    console.error('小程序错误:', msg);
  },

  // 获取系统信息
  getSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res;
        console.log('系统信息:', res);
      },
      fail: (err) => {
        console.error('获取系统信息失败:', err);
      }
    });
  },

  // 获取网络状态
  getNetworkType() {
    wx.getNetworkType({
      success: (res) => {
        this.globalData.networkType = res.networkType;
        console.log('网络状态:', res.networkType);
      },
      fail: (err) => {
        console.error('获取网络状态失败:', err);
      }
    });
  },

  // 监听网络状态变化
  watchNetworkStatus() {
    wx.onNetworkStatusChange((res) => {
      this.globalData.networkType = res.networkType;
      console.log('网络状态变化:', res.networkType);
      
      // 网络状态变化时的处理
      if (res.networkType === 'none') {
        wx.showToast({
          title: '网络连接已断开',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.isLoggedIn = true;
      console.log('用户已登录:', userInfo);
    } else {
      this.globalData.isLoggedIn = false;
      console.log('用户未登录');
    }
  },

  // 设置登录状态
  setLoginStatus(token, userInfo) {
    this.globalData.token = token;
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = true;
    
    // 保存到本地存储
    wx.setStorageSync('token', token);
    wx.setStorageSync('userInfo', userInfo);
  },

  // 清除登录状态
  clearLoginStatus() {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    this.globalData.isLoggedIn = false;
    
    // 清除本地存储
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
  },

  // 检查网络连接
  checkNetwork() {
    return new Promise((resolve, reject) => {
      if (this.globalData.networkType === 'none') {
        wx.showToast({
          title: '请检查网络连接',
          icon: 'none',
          duration: 2000
        });
        reject(new Error('网络连接已断开'));
      } else {
        resolve();
      }
    });
  },

  // 显示加载提示
  showLoading(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    });
  },

  // 隐藏加载提示
  hideLoading() {
    wx.hideLoading();
  },

  // 显示成功提示
  showSuccess(title = '操作成功') {
    wx.showToast({
      title: title,
      icon: 'success',
      duration: 2000
    });
  },

  // 显示错误提示
  showError(title = '操作失败') {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 2000
    });
  },

  // 显示确认对话框
  showConfirm(content, title = '提示') {
    return new Promise((resolve) => {
      wx.showModal({
        title: title,
        content: content,
        success: (res) => {
          resolve(res.confirm);
        }
      });
    });
  },

  // 页面跳转
  navigateTo(url) {
    wx.navigateTo({
      url: url
    });
  },

  // 页面重定向
  redirectTo(url) {
    wx.redirectTo({
      url: url
    });
  },

  // 重新启动到指定页面
  reLaunch(url) {
    wx.reLaunch({
      url: url
    });
  },

  // 返回上一页
  navigateBack(delta = 1) {
    wx.navigateBack({
      delta: delta
    });
  },

  // 切换到TabBar页面
  switchTab(url) {
    wx.switchTab({
      url: url
    });
  }
})
