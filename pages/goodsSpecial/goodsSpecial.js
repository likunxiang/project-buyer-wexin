// pages/guangNavDetail/guangNavDetail.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		id: 0,
		page: 1
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			gid: options.gid,
		})
		this.getGoods()
	},
	toSearch: function() {
		wx.navigateTo({
			url: '/pages/newSearch/newSearch'
		})
	},
	// getCartNum: function() {
	// 	var self = this
	// 	getApp().request({
	// 		url: getApp().api.default.cartCount,
	// 		success: function(res) {
	// 			if (res.code == 0) {
	// 				self.setData({
	// 					cartNum: res.data.count
	// 				})
	// 			}
	// 		}
	// 	})
	// },
	getGoods: function() {
		var self = this
		getApp().request({
			url: getApp().api.default.goods_special,
			data: {
				gid: self.data.gid,
				page: 1
			},
			success: function(res) {

				if (res.code == 0) {
					wx.setNavigationBarTitle({
						title: res.data.group_name
					})
					self.setData({
						title: res.data.group_name,
						goodsList: res.data.list,
						count: res.data.row_count
					})
				}
			},
			complete: function() {
				getApp().core.stopPullDownRefresh()
			}
		})
	},
	// toCart: function() {
	// 	wx.navigateTo({
	// 		url: '/pages/cart/cart'
	// 	})
	// },
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {},

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

		this.setData({
			page: 1
		})
		this.getGoods()
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {
		var self = this

		var page = self.data.page

		if (self.data.goodsList.length < self.data.count) {
			++page
			self.setData({
				page: page
			})
		} else {
			return
		}


		getApp().request({
			url: getApp().api.default.goods_special,
			data: {
				gid: self.data.gid,
				page: page
			},
			success: function(res) {


				if (res.code == 0) {
					var newGoodList = res.data.list
					var nowGoodList = self.data.goodsList.concat(newGoodList)
					self.setData({
						goodsList: nowGoodList
					})
				}
			}
		})
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {
		var self = this
		var title = self.data.title
		return getApp().page.onShareQp(this, 'gid=' + self.data.gid, title);
	}
})
