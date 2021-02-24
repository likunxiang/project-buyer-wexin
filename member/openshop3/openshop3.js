// pages/openshop3/openshop3.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
			shopName:'',
			isRead: false,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var name = getApp().core.getStorageSync('USER_INFO').nickname + '的亲铺'
		this.setData({
			mch_shop_name: name,
			shopName: name
		})
		this.getData()
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},
	editName: function(e) {
		var value = e.detail.value
		this.setData({
			shopName: value
		})
	},
	read: function () {
		this.setData({
			isRead:!this.data.isRead
		})
	},
	getData: function () {
		var self = this 
		getApp().request({
			url: getApp().api.mch.user.apply_pre_data,
			success:(res) => {
				this.setData(res.data)
				this.setData({
					mch_shop_name: res.data.mch_name || getApp().core.getStorageSync('USER_INFO').nickname + '的亲铺',
					shopName: res.data.mch_name || getApp().core.getStorageSync('USER_INFO').nickname + '的亲铺'
				})
			}
		})
	},
	toPrivacyArticleDetail: function () {
		wx.navigateTo({
			url:'/member/article-detail/article-detail?id=' + this.data.privacy_id 
		})
	},
	toAgreementIdArticleDetail: function () {
		wx.navigateTo({
			url:'/member/article-detail/article-detail?id=' + this.data.agreement_id 
		})
	},
	submit: function () {
		var self = this
		if (!self.data.isRead) {
			wx.showToast({
				title:'请先阅读相关协议',
				duration:2500,
				icon:'none'
			})
			return
		}
		if (self.data.shopName.length>11) {
			wx.showToast({
				title: '店铺名过长将造成显示不完整，请修改',
				icon: 'none',
				duration: 2500
			})
			return
		}
		getApp().request({
			url: getApp().api.mch.user.apply_pre_save,
			method:'POST',
			data: {
				mch_name: self.data.shopName
			},
			success: function (res) {
				if (res.code==0) {
					wx.showModal({
						content: res.msg,
						showCancel: false,
						icon: 'none',
						success: function (res) {
							if (res.confirm) {
								wx.reLaunch({
									// url: '/pages/openshopStatus/openshopStatus?status=' + status,
									url: '/pages/index/index'
								})
							}
						}
					})
				}
				if (res.code==1) {
					wx.showToast({
						title: res.msg,
						icon: 'none',
						duration:2500
					})
				}
			}
		})
		
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
