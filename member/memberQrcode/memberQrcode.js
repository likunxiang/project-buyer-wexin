// member/memberQrcode/memberQrcode.js
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
		this.getShareData()
	},
	getShareData() {
		getApp().request({
			url: getApp().api.default.share_data,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						sid: res.data.id
					})
					this.getQrcode()
				}
			}
		})
	},
	getQrcode() {
		getApp().request({
			url: getApp().api.default.member_share_qrcode,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				sid: this.data.sid
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						pic_url: res.data.pic_url
					})
				}
			}
		})
	},
	// 保存素材
	saveMaterial() {
		wx.downloadFile({
			url: this.data.pic_url,
			success(res) {
				if (res.statusCode === 200) {
					// 保存内容为海报
					wx.saveImageToPhotosAlbum({
						filePath: res.tempFilePath,
						success: function(res) {
							wx.showToast({
								title: '保存成功！',
								icon: 'none'
							})

						},
						fail(res) {
							wx.showToast({
								title: '保存失败！',
								icon: 'none'
							})
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
