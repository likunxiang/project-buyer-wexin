// pages/paySucceed/paySucceed.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.getSuperiorInfo()
	},
	goBack() {
		wx.navigateBack({
			delta: 1,
			fail: (res) => {
				wx.redirectTo({
					url: '/pages/index/index'
				})
			}
		})
	},
	getSuperiorInfo() {
		getApp().request({
			url: getApp().api.default.get_superior_info,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData(res.data)
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			}
		})
	},
	copy: function(e) {
		var text = e.currentTarget.dataset.text
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

	}
})
