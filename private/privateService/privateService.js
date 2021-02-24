// pages//private/privateService/privateService.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		is_ready: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.getArticle()
	},
	getArticle () {
		getApp().request({
			url: getApp().api.selfSupport.get_article,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						fwxyzd: res.data.fwxyzd.content,
						fwxy_id: res.data.fwxy_id,
						ywjs: res.data.ywjs.content,
						ystk_id: res.data.ystk_id
					})
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			}
		})
	},
	// 申请开私店
	openPrivate() {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.open_private,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id
			},
			success(res) {
				if (res.code == 0) {
					wx.showModal({
						title: '开通成功',
						showCancel: false,
						success: (res) => {
							wx.redirectTo({
								url: "/private/submitMaterial/submitMaterial",
							})
						}
					})
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			}
		})
	},
	ready() {
		this.setData({
			is_ready: !this.data.is_ready
		})
	},
	sureBtn() {
		
		this.openPrivate()

	},
	//通过绑定手机号登录
	getPhoneNumber: function(e) {
		if (!this.data.is_ready) {
			wx.showToast({
				title: '请勾选已阅读相关协议',
				icon: 'none',
				duration: 2500
			})
			return
		}
		var ivObj = e.detail.iv
		var telObj = e.detail.encryptedData
		var codeObj = "";
		var that = this;
		//执行Login
		wx.login({
			success: res => {
				//用code传给服务器调换session_key
				getApp().request({
					url: getApp().api.selfSupport.open_private, //接口请求地址
					method: 'POST',
					data: {
						// appid: " ", //小程序appid，登录微信后台查看
						// secret: " ", //小程序secret，登录微信后台可查看
						code: res.code,
						encrypted_data: telObj,
						iv: ivObj
					},
					//成功返回数据
					success: function(res) {
						if (res.code == 0) {
							wx.showModal({
								title: '开通成功',
								showCancel: false,
								success: (res) => {
									wx.redirectTo({
										url: "/private/submitMaterial/submitMaterial",
									})
								}
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
		})
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {},

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
