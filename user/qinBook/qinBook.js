// user/qinBook/qinBook.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom,
		showState: true, //true显示用户，false显示品牌
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.qinBookIndex()
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
	qinBookIndex() {
		getApp().request({
			url: getApp().api.maijia.mch_note_index,
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						indexInfo: res.data
					})
				} else {
		
				}
			}
		})
	},
	getData() {
		getApp().request({
			url: getApp().api.maijia.user_brand_list,
			data: {
				type: this.data.showState?'user':'brand',
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						dataList: res.data
					})
				} else {

				}
			}
		})
	},
	//搜索
	toSeach() {
		wx.navigateTo({
			url: '/user/qinSeach/qinSeach',
		})
	},
	//切换显示用户和品牌
	changeShow() {
		this.setData({
			showState: !this.data.showState
		})
		this.getData()
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
	//去品牌偏好页
	toPinpaiLike(e) {
		wx.navigateTo({
			url: '/user/pinpaiLike/pinpaiLike?brand_id=' + e.currentTarget.dataset.id + '&brand_name=' + e.currentTarget.dataset.name,
		})
	},
	//去全部活动页面
	toActiveAll() {
		wx.navigateTo({
			url: '/user/remindAll/remindAll',
		})
	},
	//去添加页面
	toAddLike() {
		wx.navigateTo({
			url: '/user/addPinpai/addPinpai',
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
		this.getData()
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
