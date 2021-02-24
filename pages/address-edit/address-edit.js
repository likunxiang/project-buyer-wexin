var area_picker = require('./../../components/area-picker/area-picker.js');
import util from '../../utils/util.js'
Page({
	data: {
		name: "",
		mobile: "",
		detail: "",
		district: null,
		is_default: 0,
		town_index: 0,
		old_value: [3, 3, 3],
		myaddress: null
	},
	onLoad: function(options) {
		getApp().page.onLoad(this, options);

		var self = this;
		setTimeout(() => {
			self.getDistrictData(function(data) {
				area_picker.init({
					page: self,
					data: data,
					checked: self.data.old_value
				});
			});
		}, 1000);

		self.setData({
			address_id: options.id,
		});
		if (options.id) {
			getApp().core.showLoading({
				title: "正在加载",
				mask: true,
			});
			getApp().request({
				url: getApp().api.user.address_detail,
				data: {
					id: options.id,
				},
				success: function(res) {

					getApp().core.hideLoading();
					if (res.code == 0) {
						self.setData(res.data);
						var district_id = res.data.district.district.id
						self.getTown(district_id)
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
	getDistrictData: function(cb) {
		let self = this;
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


						self.setData({

							old_value: self.getChecked(district)
						})
						cb(district);

					}
				}
			});
			return;
		}


		self.setData({
			old_value: self.getChecked(district)
		})
		cb(district);
	},

	onAreaPickerConfirm: function(e) {
		var self = this;
		var district_id = e[2].id
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
			},
		});
		if (district_id) {
			self.getTown(district_id)
		}
	},
	getTown(district_id) {
		var self = this
		getApp().request({
			url: getApp().api.default.son_district,
			data: {
				id: district_id
			},
			success: (res) => {

				setTimeout(() => {
					res.data.some((item, index) => {

						if (item.name == self.data.district.town.name) {
							self.setData({
								town_index: index
							})
							return true;
						}
					})
				}, 1200);
				if (res.code == 0) {
					var district = self.data.district
					if (!district.town) {
						var town_list = res.data
						district.town = {}
						district.town.id = town_list[self.data.town_index].id
						district.town.name = town_list[self.data.town_index].name
						self.setData({
							town_list: res.data,
							district: district
						})


					} else {
						var town_list = res.data
						self.setData({
							town_list: res.data,
						})
					}
				}
			}
		})
	},
	disableTown() {
		wx.showModal({
			content: '请先选择所在地区',
			showCancel: false,
		})
	},
	townAreaPick(e) {

		var town_list = this.data.town_list
		var district = this.data.district
		district.town = {}
		district.town.id = town_list[e.detail.value].id
		district.town.name = town_list[e.detail.value].name
		this.setData({
			town_index: e.detail.value,
			district: district
		})
	},
	saveAddress: util.throttle(function() {
		this.saveAddress1()
	}, 1000),
	saveAddress1: function() {
		var self = this;
		// var myreg = /^([0-9]{6,12})$/;
		// var myreg2 = /^(\d{3,4}-\d{6,9})$/;
		// var myreg3 = /^\+?\d[\d -]{8,12}\d/;
		var myreg=/^[1][3,4,5,7,8][0-9]{9}$/;
		if (!myreg.test(self.data.mobile)) {
			self.showToast({
				title: "联系电话格式不正确",
			});
			return false;
		}

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
				},
				town: {
					id: ""
				},
			};
		}
		// if (!district.town) {
		// 	self.showToast({
		// 		title: '所在区没有填',
		// 	});
		// 	return
		// }
		getApp().core.showLoading({
			title: "正在保存",
			mask: true,
		});
		getApp().request({
			url: getApp().api.user.address_save,
			method: "post",
			data: {
				address_id: self.data.address_id || "",
				name: self.data.name,
				mobile: self.data.mobile,
				province_id: district.province.id,
				city_id: district.city.id,
				district_id: district.district.id,
				town_id: district.town.id || '',
				detail: self.data.detail,
				is_default: self.data.is_default

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
					self.showToast({
						title: res.msg,
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

	getWechatAddress: function(e) {
		var self = this;
		getApp().core.chooseAddress({
			success: function(e) {
				if (e.errMsg != 'chooseAddress:ok')
					return;
				getApp().core.showLoading();
				getApp().request({
					url: getApp().api.user.wechat_district,
					data: {
						national_code: e.nationalCode,
						province_name: e.provinceName,
						city_name: e.cityName,
						county_name: e.countyName,
					},
					success: function(res) {
						if (res.code == 1) {
							getApp().core.showModal({
								title: '提示',
								content: res.msg,
								showCancel: false,
							});
						}
						self.setData({
							name: e.userName || "",
							mobile: e.telNumber || "",
							detail: e.detailInfo || "",
							district: res.data.district,
						});
					},
					complete: function() {
						getApp().core.hideLoading();
					}
				});
			}
		});
	},

	onShow: function() {
		getApp().page.onShow(this);
	},
	//获取默认地址
	getChecked: function(adds) {
		this.setData({
			old_value: [2, 2, 9]
		});
		//        console.log('999999999999999999999')
		//console.log('adds', adds);
		let errData = {
			province: {
				name: '999'
			},
			city: {
				name: '999'
			},
			district: {
				name: '999'
			}
		}
		let districts = this.data.district || errData;
		let province = districts.province.name || '999';
		let city = districts.city.name || '999';
		let district = districts.district.name || '999';
		let arr = [0, 0, 0];
		//console.log(province,city,district)
		adds.some((item, index) => {
			if (item.name == province) {
				//console.log('item',item)
				arr[0] = index;
				return true;
			}
		})
		adds[arr[0]].list.some((item, index) => {
			if (item.name == city) {
				//console.log('item',item)
				arr[1] = index;
				return true;
			}
		})
		adds[arr[0]].list[arr[1]].list.some((item, index) => {
			//console.log(item)
			if (item.name == district) {
				// console.log('item',item)
				arr[2] = index;
				return true;
			}
		})

		//console.log('新',arr)
		this.setData({
			old_value: arr
		})
		return arr
	}
});
