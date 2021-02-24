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
		order_id: 0

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var self = this;
		getApp().core.showLoading({
			title: "正在加载",
		});
		self.setData({
			order_id: options.order_id,
		})
		getApp().request({
			url: getApp().api.selfSupport.get_order_data,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				id: options.order_id,
			},
			success: function(res) {
				var address = getApp().core.getStorageSync(getApp().const.PICKER_ADDRESS);
				var res_data = res.data
				if (res.code == 0) {
					if(res_data.address == '') {
						res_data.address = address.address
						res_data.name = address.name
						res_data.mobile = address.mobile
					}
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
