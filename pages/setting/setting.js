// pages/setting/setting.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		userId: getApp().core.getStorageSync('USER_INFO').id
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.loadGuang()
	},
	changeGuang: function (e) {
		var self = this
		self.setData({
			guangSwitch: !self.data.guangSwitch
		})
		wx.getSetting({
			withSubscriptions: true,
			success: function (res) {
			}
		})
		self.editGuang()
	},
	loadGuang: function () {
		var self = this
		getApp().request({
			url: getApp().api.mch.user.get_user_privacy,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id
			},
			success: function(res) {
				if (res.code == 0) {
					if (res.data.guangdian== 0) {
						self.setData({
							guangSwitch: false
						})
					} else {
						self.setData({
							guangSwitch: true
						})
					}
				}
			}
		})
	},
	editGuang: function () {
		var self = this
		var flag = self.data.guangSwitch
		if (flag) {
			flag = 1
		} else {
			flag = 0
		}
		getApp().request({
			url: getApp().api.mch.user.user_privacy,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				flag: flag
			},
			success: function(res) {
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
