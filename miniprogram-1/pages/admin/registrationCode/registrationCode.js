import { adminAPI } from '../../../utils/api.js';

Page({
  data: {
    code: '',
    saving: false,
  },

  onInput(e) {
    this.setData({ code: e.detail.value });
  },

  async saveCode() {
    const { code } = this.data;
    if (!code || !code.trim()) {
      wx.showToast({ title: '请输入注册码', icon: 'none' });
      return;
    }
    this.setData({ saving: true });
    try {
      await adminAPI.setRegistrationCode({ code: code.trim() });
      wx.showToast({ title: '更新成功', icon: 'success' });
    } catch (e) {
      wx.showToast({ title: e.message || '更新失败', icon: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  }
});
