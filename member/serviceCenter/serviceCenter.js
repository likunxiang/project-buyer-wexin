// pages/serviceCenter/serviceCenter.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navList: [{
			id: 1,
			name: '常见问题'
		},{
			id: 2,
			name: '购物指南'
		},{
			id: 3,
			name: '订单指南'
		},{
			id: 4,
			name: '退货退款'
		}],
		navIns: 0,
		questionList: [{
			id: 1,
			name: '安全小提示'
		},{
			id: 2,
			name: '发货时间'
		},{
			id: 3,
			name: '如何申请售后'
		},{
			id: 4,
			name: '商品质量问题'
		}],
		questionIns: 0,
		searchList: [{
			id: 1,
			name: '多长时间可以申请退货退款'
		},{
			id: 2,
			name: '退货注意事项'
		},{
			id: 3,
			name: '如何申请退货退款/仅退款'
		},{
			id: 4,
			name: '商品质量问题'
		}]
		
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {

	},
	seachInput(e) {
		this.setData({
			searchValue: e.detail.value,
			is_search: true
		})
		// this.getWalkGoodsList()
	},
	clearSearch () {
		this.setData({
			searchValue: '',
			is_search: false
		})
		// this.getWalkGoodsList()
	},
	changeNav (e) {
		var index = e.currentTarget.dataset.index
		this.setData({
			navIns: index
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
