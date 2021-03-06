// order-submit.js
import utils from '../../utils/util.js'
var app = getApp();
var api = getApp().api;
var longitude = "";
var latitude = "";
var util = getApp().helper;
var is_loading_show = false;

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		x: getApp().core.getSystemInfoSync().windowWidth,
		y: getApp().core.getSystemInfoSync().windowHeight,
		total_price: 0,
		address: null,
		express_price: 0.00,
		express_price_1: 0.00,
		integral_radio: 1,
		new_total_price: 0,
		show_card: false,
		payment: 0,
		show_payment: false,
		show_more: false,
		index: -1,
		mch_offline: true,
		couponIndex: 0,
		is_tips: true,
		buy_member: false,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {

		getApp().page.onLoad(this, options);
		var self = this;
		var time = util.formatData(new Date());
		getApp().core.removeStorageSync(getApp().const.INPUT_DATA);
		self.setData({
			options: options,
			submit_mch_list: options.mch_list,
			time: time
		});
		is_loading_show = false;
	},
	closeTips() {
		this.setData({
			is_tips: false
		})
	},
	bindContentInput: function(e) {
		this.setData({
			remark: e.detail.value
		});

	},

	KeyName: function(e) {
		var mch_list = this.data.mch_list;
		var index = e.currentTarget.dataset.index;
		mch_list[index].offline_name = e.detail.value
		this.setData({
			mch_list: mch_list
		});
	},

	KeyMobile: function(e) {
		var mch_list = this.data.mch_list;
		var index = e.currentTarget.dataset.index;
		mch_list[index].offline_mobile = e.detail.value
		this.setData({
			mch_list: mch_list
		});
	},

	getOffline: function(e) {
		var self = this;
		var offline = e.currentTarget.dataset.offline;
		var index = e.currentTarget.dataset.index;
		var mch_list = self.data.mch_list;
		mch_list[index].offline = offline;
		self.setData({
			mch_list: mch_list,
		});
		if (mch_list.length == 1 && mch_list[0].mch_id == 0 && mch_list[0].offline == 1) {
			self.setData({
				mch_offline: false
			});
		} else {
			self.setData({
				mch_offline: true
			});
		}
		self.getPrice();
	},

	dingwei: function() {
		var self = this;
		getApp().getauth({
			content: "需要获取您的地理位置授权，请到小程序设置中打开授权",
			author: "scope.userLocation",
			success: function(e) {
				if (e) {
					if (e.authSetting["scope.userLocation"]) {
						getApp().core.chooseLocation({
							success: function(e) {
								longitude = e.longitude;
								latitude = e.latitude;
								self.setData({
									location: e.address,
								});
								self.getOrderData(self.data.options);
							}
						})
					} else {
						getApp().core.showToast({
							title: '您取消了授权',
							image: "/images/icon-warning.png",
						})
					}
				}
			}
		});
	},
	orderSubmitThrottle: utils.throttle(function() {
		this.orderSubmit()
	}, 1000),
	orderSubmit: function(e) {
		var self = this;
		var data = {};
		if (self.data.pickAddress) {
			data.dispatching_id = self.data.pickAddress.id || ''
		}
		if (self.data.remark) {
			data.remark = self.data.remark || ''
		}
		var mch_list = self.data.mch_list;

		for (var k in mch_list) {
			var form = mch_list[k].form;
			if (form && form.is_form == 1 && mch_list[k].mch_id == 0) {
				var form_list = form.list;
				for (var i in form_list) {
					if (form_list[i].required == 1) {
						if (form_list[i].type == 'radio' || form_list[i].type == 'checkbox') {
							var is_true = false;
							for (var j in form_list[i].default_list) {
								if (form_list[i].default_list[j].is_selected == 1) {
									is_true = true;
								}
							}
							if (!is_true) {
								getApp().core.showModal({
									title: '提示',
									content: '请填写' + form.name + '，加‘*’为必填项',
									showCancel: false
								})
								return false;
							}
						} else {
							if (!form_list[i].default || form_list[i].default == undefined) {
								getApp().core.showModal({
									title: '提示',
									content: '请填写' + form.name + '，加‘*’为必填项',
									showCancel: false
								})
								return false;
							}
						}
					}
				}
			}
			if (mch_list.length == 1 && mch_list[k].mch_id == 0 && mch_list[k].offline == 1) {} else {
				if (!self.data.address) {
					getApp().core.showModal({
						title: '提示',
						content: '请选择收货地址',
						showCancel: false
					})
					return false;
				}
				data.address_id = self.data.address.id;
				if (self.data.buy_member) {
					data.buy_member = true
				}
				data.use_subsidy = mch_list[k].subsidy
			}
		}
		var mchList = [{
			"mch_id": 0,
			"goods_list": []
		}];
		var goods_length = mch_list[0].goods_list.length
		for (var i = 0; i < goods_length; i++) {
			var gInfo = mch_list[0].goods_list[i];
			mchList[0]['goods_list'][i] = {
				"goods_id": gInfo.id,
				"cart_id": gInfo.cart_id || '',
				"num": gInfo.num,
				"sku": gInfo.sku,
				"from": (gInfo.from || 1),
			};
		}
		data.mch_list = JSON.stringify(mchList);
		// if (self.data.pond_id > 0) {
		//     if (self.data.express_price > 0 && self.data.payment == -1) {
		//         self.setData({
		//             show_payment: true
		//         });
		//         return false;
		//     }
		// } else {
		//     if (self.data.payment == -1) {
		//         self.setData({
		//             show_payment: true
		//         });
		//         return false;
		//     }
		// }
		self.data.integral_radio == 1 ? data.use_integral = 1 : data.use_integral = 2;

		data.payment = self.data.payment;
		// data.formId = e.detail.formId;
		// if (wx.getStorageSync('promoter').id) {
		//   data.promoter = wx.getStorageSync('promoter').id
		// }else {
		//   data.promoter = ''
		// }
		var order_type = self.data.order_type
		if (order_type && order_type == 3) {
			self.order_submit(data, 'pt');
		} else {
			self.order_submit(data, 's');
		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function(e) {
		if (is_loading_show) {
			return;
		}
		is_loading_show = true;
		getApp().page.onShow(this);
		var self = this;
		var address = getApp().core.getStorageSync(getApp().const.PICKER_ADDRESS);
		if (address) {
			self.setData({
				address: address
			});
		}
		self.getOrderData(self.data.options);
	},


	getOrderData: function(options) {
		var self = this;
		var data = {};
		var address_id = "";
		if (self.data.address && self.data.address.id)
			address_id = self.data.address.id;
		data.address_id = address_id;
		data.longitude = longitude;
		data.latitude = latitude;

		getApp().core.showLoading({
			title: "正在加载",
			mask: true,
		});

		data.mch_list = options.mch_list;
		getApp().request({
			url: getApp().api.order.new_submit_preview,
			method: "POST",
			data: data,
			success: function(res) {
				getApp().core.hideLoading();
				if (res.code == 0) {
					var input_data = getApp().core.getStorageSync(getApp().const.INPUT_DATA);
					var res_data = res.data;

					var payment = -1;
					var integral_radio = 1;
					var mch_list = res_data.mch_list;
					var mch_list_other = [];
					if (input_data) {
						mch_list_other = input_data.mch_list;
						payment = input_data.payment;
						integral_radio = input_data.integral_radio;
					}
					if (res_data.mch_list[0].sqtgData && res_data.mch_list[0].sqtgData.code == 0) {
						var pickAddress = getApp().core.getStorageSync('PICK_ADDRESS')
						var groupId = res_data.mch_list[0].sqtgData.data.communityIdTo
						self.setData({
							is_pickAddress: true,
							pickAddress: pickAddress,
							groupId: groupId
						})
					}

					// 是否选用积分
					res_data.integral_radio = integral_radio;

					// 支付方式
					for (var i in res_data.pay_type_list) {
						if (payment == res_data.pay_type_list[i].payment) {
							res_data.payment = payment;
							break;
						}
						if (res_data.pay_type_list.length == 1) {
							res_data.payment = res_data.pay_type_list[i].payment;
							break;
						}
					}

					for (var i in mch_list) {
						var shop = {};
						var picker_coupon = {};
						mch_list[i].show = true;
						mch_list[i].show_length = mch_list[i].goods_list.length - 1;
						// 判断是否有缓存的用户填写信息
						if (mch_list_other.length != 0) {
							for (var j in mch_list_other) {
								if (mch_list[i].mch_id == mch_list_other[j].mch_id) {
									mch_list[i].remark = mch_list_other[j].remark;
									mch_list[i].form = mch_list_other[j].form;
									shop = mch_list_other[j].shop;
									picker_coupon = mch_list_other[j].picker_coupon;
									mch_list[i].offline_name = mch_list_other[j].offline_name;
									mch_list[i].offline_mobile = mch_list_other[j].offline_mobile;
								}
							}
						}
						// 门店选择
						for (var j in mch_list[i].shop_list) {
							if (shop && shop.id == mch_list[i].shop_list[j].id) {
								mch_list[i].shop = shop;
								break;
							}
							if (mch_list[i].shop_list.length == 1) {
								mch_list[i].shop = mch_list[i].shop_list[j];
								break;
							}
							if (mch_list[i].shop_list[j].is_default == 1) {
								mch_list[i].shop = mch_list[i].shop_list[j];
								break;
							}
						}
						// 优惠券
						if (picker_coupon) {
							for (var j in mch_list[i].coupon_list) {
								if (picker_coupon.id == mch_list[i].coupon_list[j].id) {
									mch_list[i].picker_coupon = picker_coupon;
									break;
								}
							}
						}

						// 判断配送方式
						if (mch_list[i].send_type && mch_list[i].send_type == 2) {
							mch_list[i].offline = 1;
							self.setData({
								mch_offline: false
							});
						} else {
							mch_list[i].offline = 0;
						}
					}
					res_data.mch_list = mch_list;
					var index = self.data.index;
					if (index != -1 && mch_list[index].shop_list && mch_list[index].shop_list.length > 0) {
						self.setData({
							show_shop: true,
							shop_list: mch_list[index].shop_list
						});
					}
					if (res_data.address == null) {
						res_data.address = getApp().core.getStorageSync(getApp().const.PICKER_ADDRESS);
						self.setData(res_data);


					}
					self.setData(res_data);
					if (res_data.mch_list[0].goods_list[0].from) {
						var order_type = res_data.mch_list[0].goods_list[0].from
						self.setData({
							order_type: order_type
						});
					}

					// 计算总价
					self.getPrice();
				}
				if (res.code == 1) {
					getApp().core.showModal({
						title: "提示",
						content: res.msg,
						showCancel: false,
						confirmText: "返回",
						success: function(res) {
							if (res.confirm) {
								getApp().core.navigateBack({
									delta: 1,
								});
							}
						}
					});
				}
				self.showCouponPicker();
				if (self.data.coupon_list) {
					self.pickCoupon({
						'currentTarget': {
							'dataset': {
								'index': 0
							}
						}
					});
				}
			}
		});

	},

	showCouponPicker: function(e) {
		var self = this;
		var index = 0;
		var mch_list = self.data.mch_list;
		self.getInputData();
		if (mch_list !== null) {
			if (mch_list[index].coupon_list && mch_list[index].coupon_list.length > 0) {
				self.setData({
					coupon_list: mch_list[index].coupon_list,
					index: index
				});
			}
		}
	},

	pickCoupon: function(e) {
		this.showCouponPicker();
		var self = this;
		var index = e.currentTarget.dataset.index;
		var couponIndex = this.data.couponIndex;
		var mch_index = self.data.index;
		var data = getApp().core.getStorageSync(getApp().const.INPUT_DATA);
		getApp().core.removeStorageSync(getApp().const.INPUT_DATA);
		var mch_list = data.mch_list;
		if (index == '-1' || index == -1) {
			mch_list[mch_index].picker_coupon = false;
			data.show_coupon_picker = false;
			couponIndex = 0;
		} else {
			mch_list[mch_index].picker_coupon = self.data.coupon_list[index];
			data.show_coupon_picker = false;
			couponIndex = self.data.coupon_list[index].user_coupon_id
		}
		data.mch_list = mch_list;
		data.index = -1;
		self.setData(data);
		self.setData({
			couponIndex: couponIndex
		})

		self.getPrice();
	},

	showShop: function(e) {
		var self = this;
		var index = e.currentTarget.dataset.index;
		self.getInputData();
		self.setData({
			index: index
		});
		self.dingwei();
	},
	pickShop: function(e) {
		var self = this;
		var index = e.currentTarget.dataset.index;
		var mch_index = self.data.index;
		var data = getApp().core.getStorageSync(getApp().const.INPUT_DATA);
		var mch_list = data.mch_list;
		if (index == '-1' || index == -1) {
			mch_list[mch_index].shop = false;
			data.show_shop = false;
		} else {
			mch_list[mch_index].shop = self.data.shop_list[index];
			data.show_shop = false;
		}
		data.mch_list = mch_list;
		data.index = -1;
		self.setData(data);
		self.getPrice();
	},
	integralSwitchChange: function(e) {
		var self = this;
		if (e.detail.value != false) {
			self.setData({
				integral_radio: 1,
			});
		} else {
			self.setData({
				integral_radio: 2,
			});
		}
		self.getPrice();
	},
	integration: function(e) {
		var self = this;
		var integration = self.data.integral.integration;
		getApp().core.showModal({
			title: '积分使用规则',
			content: integration,
			showCancel: false,
			confirmText: '我知道了',
			confirmColor: '#c10000',
			success: function(res) {
				if (res.confirm) {}
			}
		});
	},
	contains: function(arr, obj) {
		//while
		var i = arr.length;
		while (i--) {
			if (arr[i] == obj) {
				return i;
			}
		}
		return -1;
	},
	/**
	 * 计算总价
	 */
	getPrice: function() {
		var self = this;

		var mch_list = self.data.mch_list;
		var integral_radio = self.data.integral_radio;
		var integral = self.data.integral;
		var new_total_price = 0;
		var is_area = 0;
		var invalid_area_msg = '';
		var offer_rule = {};
		for (var i in mch_list) {
			var mch = mch_list[i];
			var total_price = parseFloat(mch.total_price);
			//var goods = mch_list[i].goods_list;
			if (mch.offline == 0) {
				//if (mch.express_price) { // 计算运费
				//	total_price = total_price + parseFloat(mch.express_price);
				//}
				if (mch.offer_rule && mch.offer_rule.is_allowed == 1) {
					offer_rule = mch.offer_rule;
				}
				if (mch.is_area == 1) {
					is_area = 1
					invalid_area_msg = mch.invalid_area_msg
				}
			}
			// 计算满减
			//if (mch.youhui) {
			//	total_price = total_price - parseFloat(mch.youhui)
			//}
			// 购买会员
			//if (mch.is_member) {
			//	total_price = total_price - parseFloat(mch.m_sub_total)
			//	console.log(total_price);
			//} else {
			//	if (self.data.buy_member) {
			//		total_price = total_price + parseFloat(mch.m_buy_price)
			//		total_price = total_price - parseFloat(mch.m_sub_total)
			//	}
			//}
			// 使用津贴
			//if (mch.subsidy > 0) {
			//	total_price = total_price - parseFloat(mch.subsidy)
			//	console.log(total_price);
			//}
			// 首单立减
			//if(mch.is_first_order) {
			//	total_price = total_price - parseFloat(mch.is_first_order)
			//	console.log(total_price);
			//}
			new_total_price = new_total_price + parseFloat(mch.pay_price);
			if (self.data.buy_member) { // 购买会员的
				if (mch.is_member && !mch.is_normal_member) {
					new_total_price = new_total_price + parseFloat(mch.m_buy_price)
				}
				if (!mch.is_member) {
					new_total_price = new_total_price + parseFloat(mch.m_buy_price)
					new_total_price = new_total_price - parseFloat(mch.m_sub_total)
				}
				if (mch.express_price_discount) {
					new_total_price = new_total_price - parseFloat(mch.express_price_discount)
				}
			}
		}
		//new_total_price = new_total_price >= 0 ? new_total_price : 0;
		self.setData({
			new_total_price: new_total_price.toFixed(2),
			offer_rule: offer_rule,
			is_area: is_area,
			invalid_area_msg: invalid_area_msg
		});

	},
	cardDel: function() {
		var self = this;
		self.setData({
			show_card: false
		});
		getApp().core.redirectTo({
			url: '/pages/order/order?status=1',
		})
	},
	cardTo: function() {
		var self = this;
		self.setData({
			show_card: false
		});
	},
	formInput: function(e) {
		var self = this;
		var index = e.currentTarget.dataset.index;
		var formId = e.currentTarget.dataset.formId;
		var mch_list = self.data.mch_list;
		var form = mch_list[index].form;
		var form_list = form.list;
		form_list[formId].default = e.detail.value;
		form.list = form_list;
		self.setData({
			mch_list: mch_list
		});
	},
	selectForm: function(e) {
		var self = this;
		var mch_list = self.data.mch_list;
		var index = e.currentTarget.dataset.index;
		var formId = e.currentTarget.dataset.formId;
		var k = e.currentTarget.dataset.k;
		var form = mch_list[index].form;
		var form_list = form.list;
		var default_list = form_list[formId].default_list;
		if (form_list[formId].type == 'radio') {
			for (var i in default_list) {
				if (i == k) {
					default_list[k].is_selected = 1;
				} else {
					default_list[i].is_selected = 0;
				}
			}
			form_list[formId].default_list = default_list;
		}
		if (form_list[formId].type == 'checkbox') {
			if (default_list[k].is_selected == 1) {
				default_list[k].is_selected = 0;
			} else {
				default_list[k].is_selected = 1;
			}
			form_list[formId].default_list = default_list;
		}
		form.list = form_list;
		mch_list[index].form = form;
		self.setData({
			mch_list: mch_list
		});
	},
	showPayment: function() {
		this.setData({
			show_payment: true
		});
	},
	payPicker: function(e) {
		var index = e.currentTarget.dataset.index;
		this.setData({
			payment: index,
			show_payment: false
		});
	},
	payClose: function() {
		this.setData({
			show_payment: false
		});
	},
	getInputData: function() {
		var self = this;
		var mch_list = self.data.mch_list;
		var data = {
			integral_radio: self.data.integral_radio,
			payment: self.data.payment,
			mch_list: mch_list
		}
		getApp().core.setStorageSync(getApp().const.INPUT_DATA, data);
	},

	onHide: function() {
		getApp().page.onHide(this);
		var self = this;
		self.getInputData();
	},

	onUnload: function() {
		getApp().page.onUnload(this);
		getApp().core.removeStorageSync(getApp().const.INPUT_DATA);
	},
	uploadImg: function(e) {
		var self = this;
		var index = e.currentTarget.dataset.index;
		var formId = e.currentTarget.dataset.formId;
		var mch_list = self.data.mch_list;
		var form = mch_list[index].form;
		is_loading_show = true;
		getApp().uploader.upload({
			start: function() {
				getApp().core.showLoading({
					title: '正在上传',
					mask: true,
				});
			},
			success: function(res) {
				if (res.code == 0) {
					form.list[formId].default = res.data.url
					self.setData({
						mch_list: mch_list,
					});
				} else {
					self.showToast({
						title: res.msg,
					});
				}
			},
			error: function(e) {
				self.showToast({
					title: e,
				});
			},
			complete: function() {
				getApp().core.hideLoading();
			}
		})
	},

	goToAddress: function() {
		is_loading_show = false;
		getApp().core.navigateTo({
			url: '/pages/address-picker/address-picker',
		})
	},
	goToPickAddress: function() {
		is_loading_show = false;
		getApp().core.navigateTo({
			url: '/member/groupPickUp/groupPickUp?id=' + this.data.groupId,
		})
	},
	buyMember() {
		this.setData({
			buy_member: !this.data.buy_member
		})
		this.getPrice()
	},
});
