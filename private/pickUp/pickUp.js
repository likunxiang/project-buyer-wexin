// pages//private/pickUp/pickUp.js
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
		this.getAddressList()
	},
	getAddressList() {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_address_list,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				is_sel: 1
			},
			success(res) {
				if (res.code == 0) {
					self.setData({
						addressList: res.data.list
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
	pickAddress: function (e) {
	    var id = e.currentTarget.dataset.id;
		
		
	    getApp().core.setStorageSync('PICK_ID',id);
		
	    getApp().core.navigateBack();
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
