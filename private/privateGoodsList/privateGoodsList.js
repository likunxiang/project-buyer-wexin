// pages//private/privateGoodsList/privateGoodsList.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		tabList: ['已上架', '未上架'],
		tabIns: 0,
		status: 1,
		is_edit: -1,
		page: 1
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		
	},
	getGoodsList() {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_goods_list,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				status: self.data.status,
				order_sum_show: true,
				name: self.data.seachValue || ''
			},
			success(res) {
				if (res.code == 0) {
					self.setData({
						goodsList: res.data.list,
						is_edit: -1
					})
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			},
			complete: (res) => {
				wx.hideLoading()
				wx.stopPullDownRefresh()
			}
		})
	},
	search (e) {
		this.setData({
			seachValue: e.detail.value,
			is_search: true,
			page: 1
		})
		this.getGoodsList()
	},
	clearSearch () {
		this.setData({
			seachValue: '',
			is_search: false,
			page: 1
		})
		this.getGoodsList()
	},
	changeTab: function(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		if (index == 0) {
			self.setData({
				tabIns: index,
				status: 1,
				is_edit: -1
			})
		} else {
			self.setData({
				tabIns: index,
				status: 0,
				is_edit: -1
			})
		}
		
		this.getGoodsList()

	},
	openEdit(e) {
		var index = e.currentTarget.dataset.index
		this.setData({
			is_edit: index,
		})
	},
	closeEdit() {
		this.setData({
			is_edit: -1
		})
	},
	editGoodsStatus (e) {
		var self = this
		var type = e.currentTarget.dataset.type
		var id = e.currentTarget.dataset.id
		var status = ''
		if (type=='up') {
			status = 1
		} else {
			status = 0
		}
		getApp().request({
			url: getApp().api.selfSupport.edit_goods_status,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				status: status,
				id: id
			},
			success(res) {
				if (res.code == 0) {
					wx.showToast({
						title: res.msg,
						icon: 'none'
					})
					self.getGoodsList()
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
		
			}
		})
	},
	delGoods (e) {
		var self = this 
		var id = e.currentTarget.dataset.id
		wx.showModal({
			title: '确定删除这个商品？',
			success: (res) => {
				if (res.confirm) {
					getApp().request({
						url: getApp().api.selfSupport.del_goods,
						data: {
							userId: getApp().core.getStorageSync('USER_INFO').id,
							id: id
						},
						success(res) {
							if (res.code == 0) {
								wx.showToast({
									title: res.msg,
									icon: 'none'
								})
								self.getGoodsList()
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
		this.getGoodsList()
		this.setData({
			page: 1,
			stopLoadMore: false,
		})
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
		this.getGoodsList()
		this.setData({
			page: 1,
			stopLoadMore: false,
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
			status: self.data.status,
			order_sum_show: true,
		}
		var url = getApp().api.selfSupport.get_goods_list
		getApp().core.pading(self, url, data, function(res) {
			if (res.data.list.length == 0) {
				self.setData({
					stopLoadMore: true,
				})
				return
			}
			var newGoodList = res.data.list
			var nowGoodList = self.data.goodsList.concat(newGoodList)
			self.setData({
				goodsList: nowGoodList,
			})
		})
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})
