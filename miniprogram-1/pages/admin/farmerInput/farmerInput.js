import { adminAPI, productAPI, utils } from '../../../utils/api.js';

Page({
	data: {
		loading: false,
		farmers: [],
		farmerIndex: 0,
		selectedFarmer: null,
		form: {
			producerId: '',
			vegetableName: '',
			vegetableVariety: '',
			origin: '',
			plantingTime: '',
			harvestTime: '',
			description: '',
			imageUrl: '',
		},
	},

	onLoad() {
		this.loadFarmers();
	},

	async loadFarmers() {
		this.setData({ loading: true });
		try {
			const farmers = await adminAPI.getFarmers();
			this.setData({ farmers, loading: false });
		} catch (e) {
			console.error('加载农户失败:', e);
			this.setData({ loading: false });
			wx.showToast({ title: '加载农户失败', icon: 'none' });
		}
	},

	onFarmerChange(e) {
		const index = Number(e.detail.value);
		const farmer = this.data.farmers[index];
		this.setData({
			farmerIndex: index,
			selectedFarmer: farmer,
			'form.producerId': farmer ? farmer.id : '',
		});
	},

	onInput(e) {
		const { field } = e.currentTarget.dataset;
		this.setData({ [`form.${field}`]: e.detail.value });
	},

	onDateChange(e) {
		const { field } = e.currentTarget.dataset;
		// 小程序选择器返回 YYYY-MM-DD，将其作为 ISO 日期传回后端
		const value = e.detail.value;
		this.setData({ [`form.${field}`]: value });
	},

	async submit() {
		const f = this.data.form;
		if (!f.producerId) return wx.showToast({ title: '请选择农户', icon: 'none' });
		if (!f.vegetableName) return wx.showToast({ title: '请输入蔬菜名称', icon: 'none' });
		if (!f.origin) return wx.showToast({ title: '请输入产地', icon: 'none' });
		if (!f.plantingTime || !f.harvestTime) return wx.showToast({ title: '请选择种植/收获日期', icon: 'none' });

		this.setData({ loading: true });
		try {
			await productAPI.createProductByAdmin({
				producerId: Number(f.producerId),
				vegetableName: f.vegetableName,
				vegetableVariety: f.vegetableVariety || undefined,
				origin: f.origin,
				plantingTime: f.plantingTime,
				harvestTime: f.harvestTime,
				description: f.description || undefined,
				imageUrl: f.imageUrl || undefined,
			});
			wx.showToast({ title: '录入成功', icon: 'success' });
			this.setData({
				form: {
					producerId: this.data.form.producerId,
					vegetableName: '',
					vegetableVariety: '',
					origin: '',
					plantingTime: '',
					harvestTime: '',
					description: '',
					imageUrl: '',
				}
			});
		} catch (e) {
			console.error('录入失败:', e);
			wx.showToast({ title: '录入失败', icon: 'none' });
		} finally {
			this.setData({ loading: false });
		}
	},

	resetForm() {
		this.setData({
			form: {
				producerId: this.data.selectedFarmer ? this.data.selectedFarmer.id : '',
				vegetableName: '',
				vegetableVariety: '',
				origin: '',
				plantingTime: '',
				harvestTime: '',
				description: '',
				imageUrl: '',
			}
		});
	},
});

 