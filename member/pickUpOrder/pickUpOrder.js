// pages/pickUpOrder/pickUpOrder.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		tabList: ['进行中', '已完成', '已取消'],
		tabIns: 0,
		seachValue: '',
		page: 1,
		status: 1
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
	search(e) {
		this.setData({
			seachValue: e.detail.value,
			is_search: true,
			stopLoadMore: false,
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
			url: getApp().api.group.get_group_order_list,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				mowType: this.data.status,
				search: this.data.seachValue || '',
			},
			success: (res) => {
				if (res.code == 0) {
					var type = 1
					if (this.data.status == 1) {
						type = 1
					} else if (this.data.status == 2) {
						type = 2
					} else {
						type = 3
					}
					this.setData({
						orderList: res.data.list,
						type: type
					})
				}
			},
			complete: (res) => {
				getApp().core.hideLoading()
				getApp().core.stopPullDownRefresh()
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
		var self = this
		
		var page = self.data.page
		var index = page
		var data = {
			userId: getApp().core.getStorageSync('USER_INFO').id,
			mowType: this.data.status || 1,
			search: this.data.search || '',
		}
		var url = getApp().api.group.get_group_order_list
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

})
