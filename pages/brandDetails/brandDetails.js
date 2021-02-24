// pages/brandDetails/brandDetails.js
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
		this.getBrandDetail(options)
		
	},
	// 获取品牌详情 网络接口
	getBrandDetail:function (options) {
		var self = this
		getApp().request({
			url:getApp().api.default.brandDetail,
			data:{
				
				brand_id:options.brand_id
			},
			success:function (res) {
				if(res.code == 0) {
					getApp().core.showToast({
						title:'加载中...',
						icon:'loading',
						success:function(){
							self.setData(res.data)
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
