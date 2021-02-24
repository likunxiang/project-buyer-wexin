// pages/order-detail/order-detail.js
var app = getApp();
var api = getApp().api;
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isPageShow: false,
		order: null,
		getGoodsTotalPrice: function() {
			return this.data.order.total_price;
		},
		order_id: 0,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			nickName: getApp().core.getStorageSync('USER_INFO').nickname,
			avatarUrl: getApp().core.getStorageSync('USER_INFO').avatar_url,
			userId: getApp().core.getStorageSync('USER_INFO').id,
			mchId: getApp().core.getStorageSync('_mchInfo').id,
			storeId: getApp().core.getStorageSync('STORE').id,
			orId: options.order_id,
			type: 3 //订单页面进入
		})
		getApp().page.onLoad(this, options);
		var self = this;
		getApp().core.showLoading({
			title: "正在加载",
		});
		var pages = getCurrentPages();
		var current_page = pages[(pages.length - 2)];
		self.setData({
			status: options.status
		})
		self.setData({
			order_id: options.order_id,
			route: current_page.route
		})
	},
	onShow() {
		this.loadDate()
	},
	loadDate() {
		var self = this
		getApp().request({
			url: getApp().api.order.detail,
			data: {
				order_id: self.data.order_id,
				route: self.data.route
			},
			success: function(res) {

				var address = getApp().core.getStorageSync(getApp().const.PICKER_ADDRESS);
				var res_data = res.data
				if (res.code == 0) {
					self.setData({
						order: res_data,
						isPageShow: true
					});
				}
			},
			complete: function() {
				getApp().core.hideLoading();
			}
		});
	},
	// 整单取消
	cancelOrder: function() {
		var self = this
		getApp().core.showLoading({
			title: "操作中",
		});
		getApp().request({
			url: getApp().api.order.cancel_order,
			method: 'POST',
			data: {
				order_id: self.data.order_id,
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
								self.loadDate();
							}
						}
					});
				} else {
					getApp().core.showModal({
						title: "提示",
						content: res.msg,
						showCancel: false,
						success: function(res) {
						}
					});
				}

			}
		});
	},
	copyText: function(e) {
		var self = this;
		var text = e.currentTarget.dataset.text;
		getApp().core.setClipboardData({
			data: text,
			success: function() {
				getApp().core.showToast({
					title: "已复制"
				});
			}
		});
	},
	location: function() {
		var self = this;
		var shop = self.data.order.shop;
		getApp().core.openLocation({
			latitude: parseFloat(shop.latitude),
			longitude: parseFloat(shop.longitude),
			address: shop.address,
			name: shop.name
		})
	},
	daohang(e) {
		var latitude = parseFloat(e.currentTarget.dataset.latitude)
		var longitude = parseFloat(e.currentTarget.dataset.longitude)
		wx.openLocation({
			latitude: latitude,
			longitude: longitude,
		})
	},
	call(e) {
		var text = e.currentTarget.dataset.tel
		wx.makePhoneCall({
			phoneNumber: text,
			success(res) {

			},
			fail(res) {
				return
			}
		})
	},
	kf() {
		let that = this
		wx.getStorage({
			key: 'USER_INFO',
			success(user) {
				wx.getStorage({
					key: '_mchInfo',
					success(mch) {
						wx.navigateTo({
							url: '/pages/web/web?type=1&user_id=' + user.data.id + '&mch_id=' + mch.data.id + '&order_id=' + that.data
								.order_id,
						})
					}
				})
			}
		})
	},
	orderRevoke: function(e) {
		var self = this;
		getApp().core.showModal({
			title: "提示",
			content: "是否退款该订单？",
			cancelText: "否",
			confirmText: "是",
			success: function(res) {
				if (res.cancel)
					return true;
				if (res.confirm) {
					getApp().core.showLoading({
						title: "操作中",
					});
					getApp().request({
						url: getApp().api.order.revoke,
						data: {
							order_id: e.currentTarget.dataset.id,
						},
						success: function(res) {
							getApp().core.hideLoading();
							getApp().core.showModal({
								title: "提示",
								content: res.msg,
								showCancel: false,
								success: function(res) {
									if (res.confirm) {
										self.onLoad({
											id: self.data.order.order_id
										});
									}
								}
							});
						}
					});
				}
			}
		});
	},
	orderPay: function(e) {
		var order_id = e.currentTarget.dataset.id;

		var paramData = {}
		var url = api.order.pay_data;
		paramData.order_id = order_id;
		var route = "pages/order/order"

		getApp().core.showLoading({
			title: "正在提交",
			mask: true,
		});
		WechatPay(paramData, url, route);

		function WechatPay(paramData, url, route) {
			paramData.pay_type = "WECHAT_PAY";
			app.request({
				url: url,
				data: paramData,
				complete: function() {
					getApp().core.hideLoading();
				},
				success: function(res) {
					if (res.code == 0) {
						getApp().core.requestPayment({
							_res: res,
							timeStamp: res.data.timeStamp,
							nonceStr: res.data.nonceStr,
							package: res.data.package,
							signType: res.data.signType,
							paySign: res.data.paySign,
							success: function(e) {},
							fail: function(e) {},
							complete: function(e) {

								if (e.errMsg == "requestPayment:fail" || e.errMsg == "requestPayment:fail cancel") { //支付失败转到待支付订单列表
									getApp().core.showModal({
										title: "提示",
										content: "订单尚未支付",
										showCancel: false,
										confirmText: "确认",
										success: function(res) {
											if (res.confirm) {
												getApp().core.redirectTo({
													url: "/" + route + "?status=0",
												});
											}
										}
									});
									return;
								}
								getApp().core.redirectTo({
									url: "/" + route + "?status=1",
								});
							},
						});
					}
					if (res.code == 1) {
						getApp().core.showToast({
							title: res.msg,
							icon: 'none'
						});
					}

				}
			});
		}
	},

	orderConfirm: function(e) {
		var self = this;
		getApp().core.showModal({
			title: "提示",
			content: "是否确认已收到货？",
			cancelText: "否",
			confirmText: "是",
			success: function(res) {
				if (res.cancel)
					return true;
				if (res.confirm) {
					getApp().core.showLoading({
						title: "操作中",
					});
					getApp().request({
						url: getApp().api.order.confirm,
						data: {
							order_id: e.currentTarget.dataset.id,
						},
						success: function(res) {
							getApp().core.hideLoading();
							getApp().core.showToast({
								title: res.msg,
							});
							if (res.code == 0) {
								self.loadOrderList(3);
							}
						}
					});
				}
			}
		});
	},
});
