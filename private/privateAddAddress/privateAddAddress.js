var area_picker = require('./../../components/area-picker/area-picker.js');
import util from '../../utils/util.js'
Page({
	data: {
		name: "",
		mobile: "",
		detail: "",
		district: null,
		is_default: 0,
	},
	onLoad: function(options) {
		getApp().page.onLoad(this, options);

		var self = this;
		self.getDistrictData(function(data) {
			area_picker.init({
				page: self,
				data: data,
			});
		});

		self.setData({
			address_id: options.id,
		});
		if (options.id) {
			getApp().core.showLoading({
				title: "正在加载",
				mask: true,
			});
			getApp().request({
				url: getApp().api.selfSupport.get_address_data,
				data: {
					userId: getApp().core.getStorageSync('USER_INFO').id,
					id: options.id,
				},
				success: function(res) {
					getApp().core.hideLoading();
					if (res.code == 0) {
						self.setData(res.data);
					}
				}
			});
		}
	},
	// 是否设为默认地址
	changeDefault: function(e) {
		var self = this

		var value = e.detail.value
		if (value) {
			self.setData({
				is_default: 1
			})
		} else {
			self.setData({
				is_default: 0
			})
		}

	},
	bindStartTimeChange: function(e) {
		this.setData({
			startPickUpTime: e.detail.value
		})
	},
	bindEndTimeChange: function(e) {
		this.setData({
			endPickUpTime: e.detail.value
		})
	},
	getDistrictData: function(cb) {
		var district = getApp().core.getStorageSync(getApp().const.DISTRICT);
		if (!district) {
			getApp().core.showLoading({
				title: "正在加载",
				mask: true,
			});
			getApp().request({
				url: getApp().api.default.district,
				success: function(res) {
					getApp().core.hideLoading();
					if (res.code == 0) {
						district = res.data;
						getApp().core.setStorageSync(getApp().const.DISTRICT, district);
						cb(district);
					}
				}
			});
			return;
		}
		cb(district);
	},

	onAreaPickerConfirm: function(e) {
		var self = this;
		self.setData({
			district: {
				province: {
					id: e[0].id,
					name: e[0].name,
				},
				city: {
					id: e[1].id,
					name: e[1].name,
				},
				district: {
					id: e[2].id,
					name: e[2].name,
				},
			}
		});
	},
	saveAddress: util.throttle(function() {
		this.saveAddress1()
	}, 1000),
	saveAddress1: function() {
		var self = this;
		var myreg = /^([0-9]{6,12})$/;
		var myreg2 = /^(\d{3,4}-\d{6,9})$/;
		var myreg3 = /^\+?\d[\d -]{8,12}\d/;
		if (!myreg.test(self.data.mobile) && !myreg2.test(self.data.mobile) && !myreg3.test(self.data.mobile)) {
			self.showToast({
				title: "联系电话格式不正确",
				icon: 'none'
			});
			return false;
		}
		if (self.data.startPickUpTime && self.data.endPickUpTime) {
			var pick_up_time = self.data.startPickUpTime + '-' + self.data.endPickUpTime
		} else {
			wx.showToast({
				title: '还有信息没填',
				icon: 'none'
			})
			return false
		}
		getApp().core.showLoading({
			title: "正在保存",
			mask: true,
		});
		var district = self.data.district;
		if (!district) {
			district = {
				province: {
					id: ""
				},
				city: {
					id: ""
				},
				district: {
					id: ""
				}
			};
		}
		getApp().request({
			url: getApp().api.selfSupport.edit_address,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				id: self.data.address_id || "",
				name: self.data.name || '',
				mobile: self.data.mobile || '',
				province_id: district.province.id || '',
				city_id: district.city.id || '',
				district_id: district.district.id || '',
				detail: self.data.detail || '',
				pick_up_name: self.data.pick_up_name || '',
				pick_up_time: pick_up_time || '' 
			},
			success: function(res) {
				getApp().core.hideLoading();
				if (res.code == 0) {
					getApp().core.showModal({
						title: "提示",
						content: res.msg,
						showCancel: false,
						success: function(res) {
							if (res.confirm) {
								getApp().core.navigateBack();
							}
						}
					});
				}
				if (res.code == 1) {
					wx.showToast({
						title: res.msg,
						icon: 'none'
					});
				}
			}
		});
	},

	inputBlur: function(e) {

		var name = e.currentTarget.dataset.name;
		var value = e.detail.value;
		var data = '{"' + name + '":"' + value + '"}';
		this.setData(JSON.parse(data));
	},

	
	onShow: function() {
		getApp().page.onShow(this);
	},
});
