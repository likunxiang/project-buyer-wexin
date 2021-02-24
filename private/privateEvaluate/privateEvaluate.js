// pages//private/privateEvaluate/privateEvaluate.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		spendList: ['icon-kongxinwujiaoxing', 'icon-kongxinwujiaoxing', 'icon-kongxinwujiaoxing', 'icon-kongxinwujiaoxing',
			'icon-kongxinwujiaoxing'
		],
		serveList: ['icon-kongxinwujiaoxing', 'icon-kongxinwujiaoxing', 'icon-kongxinwujiaoxing', 'icon-kongxinwujiaoxing',
			'icon-kongxinwujiaoxing'
		],
		j: 0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {

	},
	evaluateSpend(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		for (var i = 0; i <= index; i++) {
			self.setData({
				["spendList[" + i + "]"]: 'icon-shixinwujiaoxing color-F49E3A',
			})
		}
		for (var j = index+1; j < self.data.spendList.length; j++) {
			self.setData({
				["spendList[" + j + "]"]: 'icon-kongxinwujiaoxing',
			})
		}
	},
	evaluateServe(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		for (var i = 0; i <= index; i++) {
			self.setData({
				["serveList[" + i + "]"]: 'icon-shixinwujiaoxing color-F49E3A',
			})
		}
		for (var j = index+1; j < self.data.serveList.length; j++) {
			self.setData({
				["serveList[" + j + "]"]: 'icon-kongxinwujiaoxing',
			})
		}
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
