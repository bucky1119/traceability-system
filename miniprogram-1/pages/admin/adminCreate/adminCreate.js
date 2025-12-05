import { adminAPI } from '../../../utils/api.js';

Page({
  data: {
    loading: false,
    form: {
      username: '',
      password: '',
      role: 'inspector',
    },
    roles: [
      { label: '超级管理员', value: 'admin' },
      { label: '稽核员', value: 'inspector' },
    ],
    roleIndex: 1,
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onRoleChange(e) {
    const idx = Number(e.detail.value);
    this.setData({ roleIndex: idx, 'form.role': this.data.roles[idx].value });
  },

  async submit() {
    const f = this.data.form;
    if (!f.username) return wx.showToast({ title: '请输入用户名', icon: 'none' });
    if (!f.password || f.password.length < 6) return wx.showToast({ title: '请输入至少6位密码', icon: 'none' });

    this.setData({ loading: true });
    try {
      await adminAPI.createAdmin({ username: f.username, password: f.password, role: f.role });
      wx.showToast({ title: '创建成功', icon: 'success' });
      this.setData({ form: { username: '', password: '', role: f.role } });
    } catch (e) {
      console.error('创建失败', e);
      wx.showToast({ title: e?.data?.message || '创建失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
});
