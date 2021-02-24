// pages//private/privateDistribution/privateDistribution.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		expandIns: 2,
		is_tips: false,
		express_no: '',
		express_list: [{
			id: 1,
			name: "韵达快递",
			code: "yunda"
		}, {
			id: 6,
			name: "圆通速递",
			code: "yuantong"
		}, {
			id: 5,
			name: "中通快递",
			code: "zhongtong"
		}, {
			id: 2,
			name: "邮政快递包裹",
			code: "youzhengguonei"
		}],
		scanText: '无'
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			id: options.id
		})
		this.getExpressList()
	},
	getExpressList () {
		getApp().request({
			url: getApp().api.selfSupport.get_express_list,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						express_list: res.data
					})
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			},
		})
	},
	bindExpressPickerChange: function(e) {
		var self = this
		self.setData({
			express_index: e.detail.value,
		});
	},
	expressInput(e) {
		var value = e.detail.value
		this.setData({
			express_no: value,
		})
	},
	changeType(e) {
		var type = e.currentTarget.dataset.type
		this.setData({
			expandIns: type,
		})
	},
	sureBtn() {
		var self = this
		if (self.data.expandIns == 2) {
			if (self.data.express_no.length == 0) {
				self.openTips()
				return
			}
			var data = {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				express_set: self.data.expandIns,
				express_code: self.data.express_list[self.data.express_index].code || '',
				express: self.data.express_list[self.data.express_index].name || '',
				express_no: self.data.express_no || '',
				id: self.data.id
			}
		} else {
			var data = {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				express_set: self.data.expandIns,
				id: self.data.id
			}
		}
		
		getApp().request({
			url: getApp().api.selfSupport.order_express,
			data: data,
			success: (res) => {
				if (res.code == 0) {
					wx.showModal({
						title: res.msg,
						showCancel: false,
						success: (res) => {
							if (res.confirm) {
								wx.navigateBack()
							}
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
	openTips() {
		this.setData({
			is_tips: true,
		})
	},
	closeTips() {
		this.setData({
			is_tips: false,
		})
	},
	scan() {
		var self = this
		
		wx.scanCode({
			success(res) {
				self.setData({
					express_no: res.result
				})
				var type
				var postid = res.result
				getApp().core.showLoading({
					title: '查询中'
				})
				getApp().request({
					url: 'http://www.kuaidi100.com/autonumber/autoComNum',
					data: {
						text: res.result
					},
					success: function(res){
						var type = res.auto[0].comCode;
						var express_list = self.data.express_list
						for (var i in express_list) {
							if (express_list[i].code == type) {
								self.setData({
									express_index: i
								})
							}
						}
					}, 
					fail:function(res){
						wx.showModal({
							title: '参数有误',
							icon: 'none'
						})
					},
					complete: function(){
						getApp().core.hideLoading()
					}
				})
			},
			fail(res) {
				wx.showModal({
					title: '未查到相关信息,请手动输入',
					icon: 'none'
				})
			},
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
