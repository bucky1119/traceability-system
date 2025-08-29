const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// 格式化日期时间
const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// 验证手机号
const validatePhone = (phone) => {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
};

// 验证邮箱
const validateEmail = (email) => {
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return reg.test(email);
};

// 生成随机批次编号
const generateBatchCode = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `B${timestamp}${random}`;
};

// 文件大小格式化
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 防抖函数
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 节流函数
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 深拷贝
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// 获取图片信息
const getImageInfo = (src) => {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: src,
      success: resolve,
      fail: reject
    });
  });
};

// 压缩图片
const compressImage = (src, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: src,
      quality: quality,
      success: resolve,
      fail: reject
    });
  });
};

// 选择图片
const chooseImage = (count = 1, sizeType = ['compressed'], sourceType = ['album', 'camera']) => {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count: count,
      sizeType: sizeType,
      sourceType: sourceType,
      success: resolve,
      fail: reject
    });
  });
};

// 预览图片
const previewImage = (current, urls) => {
  wx.previewImage({
    current: current,
    urls: urls
  });
};

// 保存图片到相册
const saveImageToPhotosAlbum = (filePath) => {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: resolve,
      fail: reject
    });
  });
};

// 显示加载提示
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title: title,
    mask: true
  });
};

// 隐藏加载提示
const hideLoading = () => {
  wx.hideLoading();
};

// 显示成功提示
const showSuccess = (title = '操作成功') => {
  wx.showToast({
    title: title,
    icon: 'success',
    duration: 2000
  });
};

// 显示错误提示
const showError = (title = '操作失败') => {
  wx.showToast({
    title: title,
    icon: 'none',
    duration: 2000
  });
};

// 显示确认对话框
const showConfirm = (content, title = '提示') => {
  return new Promise((resolve) => {
    wx.showModal({
      title: title,
      content: content,
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
};

// 获取系统信息
const getSystemInfo = () => {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: resolve,
      fail: reject
    });
  });
};

// 获取网络状态
const getNetworkType = () => {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      success: resolve,
      fail: reject
    });
  });
};

module.exports = {
  formatTime,
  formatNumber,
  formatDate,
  formatDateTime,
  validatePhone,
  validateEmail,
  generateBatchCode,
  formatFileSize,
  debounce,
  throttle,
  deepClone,
  getImageInfo,
  compressImage,
  chooseImage,
  previewImage,
  saveImageToPhotosAlbum,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showConfirm,
  getSystemInfo,
  getNetworkType
}
