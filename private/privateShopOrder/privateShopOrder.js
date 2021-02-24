// pages//private/privateShopOrder/privateShopOrder.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		tabList: ['未完成', '已完成', '已取消'],
		tabIns: 0,
		is_cancel: false,
		seachValue: '',
		page: 1
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {},
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
	search(e) {
		this.setData({
			seachValue: e.detail.value,
			is_search: true,
			page: 1
		})
		this.getOrderList()
	},
	clearSearch() {
		this.setData({
			seachValue: '',
			is_search: false,
			page: 1
		})
		this.getOrderList()
	},
	getOrderList() {
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.selfSupport.get_order_list,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				now_status: this.data.status || '1',
				search_name: this.data.seachValue || ''
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						orderList: res.data.list
					})
				}
			},
			complete: (res) => {
				getApp().core.hideLoading()
				getApp().core.stopPullDownRefresh()
			}
		})
	},
	orderRevoke(e) {
		var id = e.currentTarget.dataset.id
		var index = e.currentTarget.dataset.index
		var orderList = this.data.orderList
		wx.showModal({
			content: '确定取消订单？',
			cancelText: '我再想想',
			confirmText: '确定取消',
			confirmColor: '#000000',
			success: (res) => {
				if (res.confirm) {
					getApp().request({
						url: getApp().api.selfSupport.cancel_order_shoper,
						data: {
							userId: getApp().core.getStorageSync('USER_INFO').id,
							id: id,
						},
						success: (res) => {
							if (res.code == 0) {
								orderList.splice(index, 1)
								wx.showToast({
									title: '取消成功',
									icon: 'none'
								})
								this.setData({
									orderList: orderList
								})
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
	pickUpSend(e) {
		var id = e.currentTarget.dataset.id
		var index = e.currentTarget.dataset.index
		var orderList = this.data.orderList
		var data = {
			userId: getApp().core.getStorageSync('USER_INFO').id,
			express_set: 1,
			id: id
		}
		getApp().request({
			url: getApp().api.selfSupport.order_express,
			data: data,
			success: (res) => {
				if (res.code == 0) {
					wx.showToast({
						title: res.msg,
						icon: 'none',
					})
					this.getOrderList()
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			},
		})
	},
	orderAudit(e) {
		var id = e.currentTarget.dataset.id
		wx.showModal({
			title: '顾客提交了取消订单的申请',
			content: '同意申请：退款给顾客\r\n拒绝申请：订单保留',
			cancelText: '拒绝申请',
			confirmText: '同意申请',
			confirmColor: '#000000',
			success: (res) => {
				if (res.confirm) {
					getApp().request({
						url: getApp().api.selfSupport.audit_order_cancel,
						data: {
							userId: getApp().core.getStorageSync('USER_INFO').id,
							is_cancel: 1, // 1同意，0驳回
							id: id
						},
						success: (res) => {
							if (res.code == 0) {
								wx.showToast({
									title: '已同意取消订单',
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
				} else if (res.cancel) {
					getApp().request({
						url: getApp().api.selfSupport.audit_order_cancel,
						data: {
							userId: getApp().core.getStorageSync('USER_INFO').id,
							is_cancel: 0, // 1同意，0驳回
							id: id
						},
						success: (res) => {
							if (res.code == 0) {
								wx.showToast({
									title: '已拒绝取消订单',
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
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		this.getOrderList()
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
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})
