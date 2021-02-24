// pages//private/privateOrder/privateOrder.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		tabList: ['未完成', '已完成','已取消'],
		tabIns: 0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.getOrderList()
	},
	changeTab: function(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		self.setData({
			tabIns: index,
			status: index + 1,
			page: 1
		})
		this.getOrderList()
	},
	getOrderList () {
		getApp().request({
			url: getApp().api.selfSupport.get_order_list_user,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				now_status: this.data.status || '1',
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						orderList: res.data.list,
						wx_mobile: res.data.wx_mobile
					})
				}
			},
			complete: (res) => {
				getApp().core.hideLoading()
				getApp().core.stopPullDownRefresh()
			}
		})
	},
	confirmOrder (e) {
		var id = e.currentTarget.dataset.id
		var index = e.currentTarget.dataset.index
		var orderList = this.data.orderList
		wx.showModal({
			content: '是否确认收货？？',
			cancelText: '取消',
			confirmText: '确定',
			confirmColor: '#000000',
			success: (res) => {
				if (res.confirm) {
					getApp().request({
						url: getApp().api.selfSupport.confirm_order,
						data: {
							userId: getApp().core.getStorageSync('USER_INFO').id,
							id: id,
						},
						success: (res) => {
							if (res.code == 0) {
								wx.showToast({
									title: '已成功确认收货',
									icon: 'none'
								})
								this.getOrderList()
							} else {
								wx.showModal({
									title: res.msg,
									showCancel: false,
								})
							}
						}
					})
				}
			}
		})
	},
	orderRevoke (e) {
		var id = e.currentTarget.dataset.id
		var index = e.currentTarget.dataset.index
		var orderList = this.data.orderList
		var is_pay = orderList[index].is_pay
		if (is_pay == 0) {
			wx.showModal({
				content: '确定取消订单？',
				cancelText: '我再想想',
				confirmText: '确定取消',
				confirmColor: '#000000',
				success: (res) => {
					if (res.confirm) {
						getApp().request({
							url: getApp().api.selfSupport.cancel_order,
							data: {
								userId: getApp().core.getStorageSync('USER_INFO').id,
								id: id,
							},
							success: (res) => {
								if (res.code == 0) {
									wx.showToast({
										title: '取消成功',
										icon: 'none'
									})
									this.getOrderList()
								} else {
									wx.showModal({
										title: res.msg,
										showCancel: false,
									})
								}
							}
						})
					}
				}
			})
		} else {
			wx.showModal({
				content: '确定取消订单？建议在取消前先和店主沟通一下',
				cancelText: '我再想想',
				confirmText: '确定取消',
				confirmColor: '#000000',
				success: (res) => {
					if (res.confirm) {
						getApp().request({
							url: getApp().api.selfSupport.cancel_order,
							data: {
								userId: getApp().core.getStorageSync('USER_INFO').id,
								id: id,
							},
							success: (res) => {
								if (res.code == 0) {
									wx.showToast({
										title: '取消成功，等待店主同意',
										icon: 'none'
									})
									this.getOrderList()
								} else {
									wx.showModal({
										title: res.msg,
										showCancel: false,
									})
								}
							}
						})
					}
				}
			})
		}
	},
	copyText() {
		var text = this.data.wx_mobile
		wx.makePhoneCall({
			phoneNumber: text
		})
	},
	payOrder (e) {
		var id = e.currentTarget.dataset.id
		getApp().request({
			url: getApp().api.selfSupport.pay_data,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				pay_type: 1,
				id: id
			},
			success: (res) => {
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
					                            url: "/private/privateOrder/privateOrder" ,
					                        });
					                    }
					                }
					            });
					            return;
					        }
					
					        getApp().core.redirectTo({
					            url: "/private/privateOrder/privateOrder" ,
					        });
					
					
					    },
					});
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
						success: (res) => {
							this.getOrderList()
						}
					})
				}
			}
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
		this.getOrderList()
		this.setData({
			page: 1,
			stopLoadMore: false
		})
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
		var self = this
		
		var page = self.data.page
		var index = page
		var data = {
			userId: getApp().core.getStorageSync('USER_INFO').id,
			now_status: this.data.status || '1',
		}
		var url = getApp().api.selfSupport.get_order_list
		getApp().core.pading(self, url, data, function(res) {
			if (res.data.list.length == 0) {
				self.setData({
					stopLoadMore: true,
				})
				return
			}
			var newGoodList = res.data.list
			var nowGoodList = self.data.orderList.concat(newGoodList)
			self.setData({
				orderList: nowGoodList,
			})
		})
	}
})
