// pages/refund-progress/refund-progress.js
var area_picker = require('./../../components/area-picker/area-picker.js');
import util from '../../utils/util.js'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		district: null,
		town_index: 0,
		old_value: [0, 0, 0]
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var self = this;
		self.getDistrictData(function(data) {
			area_picker.init({
				page: self,
				data: data,
				checked: self.data.old_value
			});
		});
		self.setData({
			id: options.id,
			nickName: getApp().core.getStorageSync('USER_INFO').nickname,
			avatarUrl: getApp().core.getStorageSync('USER_INFO').avatar_url,
			userId: getApp().core.getStorageSync('USER_INFO').id,
			mchId: getApp().core.getStorageSync('_mchInfo').id,
			storeId: getApp().core.getStorageSync('STORE').id,
			type: 3 // 售后进入
		})
		self.getRefundGrogress()
		self.getExpressList()
	},
	getRefundGrogress() {
		getApp().request({
			url: getApp().api.order.refund_step,
			data: {
				refund_id: this.data.id
			},
			success: (res) => {
				if (res.code == 0) {
					var progressObj = res.data.desc
					var reasonObj = res.data.reason_comp
					var progressArr = []
					var reasonArr = []
					for (let i in progressObj) {
						var obj1 = {
							id: i,
							name: progressObj[i],
						}
						progressArr.push(obj1)
					}
					for (let j in reasonObj) {
						var obj2 = {
							id: j,
							name: reasonObj[j],
						}
						reasonArr.push(obj2)
					}
					this.setData({
						refund_progress: res.data,
						progress: progressArr,
						reason: reasonArr,
						is_jd: res.data.is_jd,
						supplier_id: res.data.supplier_id
					})
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			}
		})
	},
	// 输入快递信息
	getExpressList() {
		getApp().request({
			url: getApp().api.selfSupport.get_express_list,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						express_list: res.data
					})
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			},
		})
	},
	sendAddress() {
		getApp().request({
			url: getApp().api.order.sure_reason_comp,
			method: 'POST',
			data: {
				reason_comp: this.data.reason_id,
				refund_id: this.data.id
			},
			success: (res) => {
				if (res.code == 0) {
					wx.showModal({
						title: res.msg,
						showCancel: false,
						success: (res) => {
							wx.navigateBack()
						}
					})
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none'
					})
				}

			}
		})
	},
	pickUpExpress() {
		if (this.data.reason_id == 40) {
			if (!this.data.express_index || !this.data.express_no || !this.data.express_price) {
				wx.showToast({
					title: '请填写快递信息',
					icon: 'none'
				})
				return
			}
			// if (supplier_id == 13) {
			// 	var url = getApp().api.order.send_express
			// } 
			// if (supplier_id == 16) {
			// 	var url = getApp().api.order.send_express_e
			// }
			getApp().request({
				url: getApp().api.order.refund_send,
				method: 'POST',
				data: {
					order_refund_id: this.data.id,
					express: this.data.express_list[this.data.express_index].name || '',
					express_no: this.data.express_no,
					freightMoney: this.data.express_price || ''
				},
				// method: 'POST',
				// url: url,
				// data: {
				// 	refund_id: this.data.id,
				// 	user_send_express: this.data.express_list[this.data.express_index].name || '',
				// 	user_send_express_no: this.data.express_no || '',
				// 	freightMoney: this.data.express_price || ''
				// },
				success: (res) => {
					if (res.code == 0) {
						wx.showModal({
							title: '提交成功',
							showCancel: false,
							success: (res) => {
								if (res.confirm) {
									wx.navigateTo()
								}
							}
						})
					}
				}
			})
		} else {
			wx.showModal({
				title: '提交成功',
				showCancel: false,
				success: (res) => {
					if (res.confirm) {
						wx.navigateTo()
					}
				}
			})
		}
	},
	cancelRefund: function() {
		var self = this
		wx.showModal({
			content: '是否取消申请',
			success: function(res) {
				if (res.confirm) {
					getApp().request({
						url: getApp().api.order.cancel_refund,
						method: 'POST',
						data: {
							order_refund_id: self.data.id
						},
						success: function(res) {
							if (res.code == 0) {
								wx.showToast({
									title: res.msg,
									icon: 'none',
									duration: 2000,
									success: function(res) {
										wx.navigateBack()
									}
								})
							} else {
								wx.showToast({
									title: res.msg,
									icon: 'none',
									duration: 2000
								})
							}
						}
					})
				}
			}
		})

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
			}
		});
		if (district_id) {
			getApp().request({
				url: getApp().api.default.son_district,
				data: {
					id: district_id
				},
				success: (res) => {
					var district = self.data.district
					if (res.code == 0) {
						var town_list = res.data
						district.town = {}
						district.town.id = town_list[self.data.town_index].id
						district.town.name = town_list[self.data.town_index].name
						self.setData({
							town_list: res.data,
							district: district
						})
					}
				}
			})
		}

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
	// 自家退货
	sendFormSubmit: function(e) {
		// var formId = e.detail.formId;
		var self = this
		var expressIndex = self.data.express_index;
		var expressNo = self.data.express_no;
		var pageType = self.data.pageType;
		if (typeof(expressIndex) == 'undefined' || typeof(expressNo) == 'undefined') {
			wx.showToast({
				title: '你有信息尚未填写',
				icon: 'none'
			})
			return
		}
		getApp().core.showLoading({
			title: '正在提交',
			mask: true,
		});

		getApp().request({
			url: getApp().api.order.refund_send,
			method: 'POST',
			data: {
				order_refund_id: self.data.id,
				express: self.data.express_list[self.data.express_index].name || '',
				express_no: expressNo,
				orderType: 'STORE'
			},
			success: function(res) {
				getApp().core.showModal({
					title: '提示',
					content: res.msg,
					showCancel: false,
					success: function(e) {
						if (res.code == 0) {
							wx.navigateBack()
						}
					},
				});
			},
			complete: function() {
				getApp().core.hideLoading();
			}
		});
	},
	copyAddress() {
		var text = this.data.refund_progress.address
		while (text.indexOf('<p>') > -1) {
			text = text.replace('<p>', '')
			text = text.replace('</p>', '\n')
		}
		wx.setClipboardData({
			data: text,
			success(res) {
				wx.getClipboardData({
					success(res) {

					}
				})
			}
		})
	},
	// 京东信息
	doorToTake() {
		var self = this
		if (!self.data.name || !self.data.mobile || !self.data.detail || !self.data.up_time) {
			wx.showToast({
				title: '您还有信息没有填写',
				icon: 'none'
			})
			return
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
		getApp().core.showLoading({
			title: "正在保存",
			mask: true,
		});
		getApp().request({
			url: getApp().api.order.upDoor,
			method: 'POST',
			data: {
				refund_id: self.data.id,
				name: self.data.name,
				phone: self.data.mobile,
				province_id: district.province.id,
				city_id: district.city.id,
				district_id: district.district.id,
				town_id: district.town.id || '',
				detail: self.data.detail,
				time: self.data.up_time
			},
			success: function(res) {
				getApp().core.hideLoading();
				if (res.code == 0) {
					getApp().core.showModal({
						title: "提示",
						content: res.msg,
						showCancel: false,
						success: function(res) {
							wx.navigateBack()
						}
					});
				}
				if (res.code == 1) {
					self.showToast({
						title: res.msg,
					});
				}
			}
		})
	},
	bindUpName(e) {
		this.setData({
			name: e.detail.value,
		});
	},
	bindUpMobile(e) {
		this.setData({
			mobile: e.detail.value,
		});
	},
	bindUpDetail(e) {
		this.setData({
			detail: e.detail.value,
		});
	},
	bindUpTime(e) {
		this.setData({
			up_time: e.detail.value,
		});
	},
	bindExpressPickerChange: function(e) {
		var self = this
		self.setData({
			express_index: e.detail.value,
		});
	},
	bindreasonPickerChange: function(e) {
		var self = this
		self.setData({
			reason_index: e.detail.value,
			reason_id: self.data.reason[e.detail.value].id
		});
	},
	expressInput(e) {
		var value = e.detail.value
		this.setData({
			express_no: value,
		})
	},
	expressPriceInput(e) {
		var value = e.detail.value
		this.setData({
			express_price: value,
		})
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	},
	//获取默认地址
	getChecked: function(adds) {
		this.setData({
			old_value: [0, 0, 0]
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
})
