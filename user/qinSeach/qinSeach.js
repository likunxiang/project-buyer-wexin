// user/qinSeach/qinSeach.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		
	},
	getSearchList () {
		getApp().request({
			url: getApp().api.maijia.user_brand_search,
			data: {
				keyword: this.data.keyword || '',
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						searchList: res.data
					})
				} else {
		
				}
			}
		})
	},
	//去用户信息页
	toUser(e) {
		wx.navigateToMiniProgram({
			appId: 'wxfd13fd712d32b3cb',
			path: '/user/user/user?user_id=' + e.currentTarget.dataset.id,
			extraData: { // 传递给目标小程序的数据，目标小程序可在 App.onLaunch，App.onShow 中获取到这份数据。
				mch_id: getApp().core.getStorageSync('_mchInfo').id,
				token: getApp().core.getStorageSync(getApp().const.ACCESS_TOKEN),
			},
			envVersion: 'trial', // 要打开的小程序版本。仅在当前小程序为开发版或体验版时此参数有效
			success(res) {
				// 打开成功
			
			},
			fail: function(res) {
			
			}
		})
	},
	//input框值发生改变
	inputChange(e) {
	    //console.log(e.detail.value)
	        this.setData({
	            keyword: e.detail.value
	        })
			this.getSearchList()
	},
	returnPage() {
	    wx.navigateBack({
	        delta: 1,
			fail: (res) => {
				wx.redirectTo({
					url: '/pages/index/index'
				})
			}
	    })
	},
	//去品牌偏好页
	toPinpaiLike(e) {
		wx.navigateTo({
			url: '/user/pinpaiLike/pinpaiLike?brand_id=' + e.currentTarget.dataset.id + '&brand_name=' + e.currentTarget.dataset.name,
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
