// pages/liveRoom/liveRoom.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		getApp().page.onLoad(this, options);
		this.liveRoomList()
	},
	liveRoomList() {
		getApp().request({
			url: getApp().api.liveApi.liveList,
			data: {
				status: 0
			},
			success: (res) => {
				if (res.code == 0) {
					var mch_id = wx.getStorageSync('_mchInfo').id;
					var user_id = getApp().core.getStorageSync('USER_INFO').id
					let customParams = encodeURIComponent(JSON.stringify({
						mch_id: mch_id,
						user_id: user_id
					}))
					this.setData({
						roomList: res.data.list,
						customParams: customParams,
						live_empty: getApp().core.getStorageSync('_img').live_empty
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
	onShow: function(options) {

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
