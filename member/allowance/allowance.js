// pages/allowance/allowance.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		is_show_model: false,
		page: 1
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.getAllowanceList()
	},
	getAllowanceList() {
		getApp().request({
			url: getApp().api.default.allowance,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						subsidy: res.data.subsidy,
						subsidyList: res.data.list,
						tips: res.data.tips,
						tipsBg: res.data.banner
					})
				}
			}
		})
	},
	// 邀请会员
	showModalVip() {
		this.setData({
			is_show_model_vip: true,
			card_bg: getApp().core.getStorageSync('_img').b1,
		})
		this.getShareImg()

	},
	closeModalVip() {
		this.setData({
			is_show_model_vip: false
		})
	},
	getMore() {
		var self = this

		var page = self.data.page
		var index = page
		var data = {
			userId: getApp().core.getStorageSync('USER_INFO').id,
		}
		var url = getApp().api.default.allowance
		getApp().core.pading(self, url, data, function(res) {
			if (res.data.list.length == 0) {
				self.setData({
					stopLoadMore: true,
				})
				return
			}
			var newGoodList = res.data.list
			var nowGoodList = self.data.subsidyList.concat(newGoodList)
			self.setData({
				subsidyList: nowGoodList,
			})
		})
	},
	showModel() {
		this.setData({
			is_show_model: true
		})
	},
	closeModel() {
		this.setData({
			is_show_model: false
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

	// 分享会员
	getShareData() {
		getApp().request({
			url: getApp().api.default.share_data,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						parent_id: res.data.parent_id,
						store_id: res.data.store_id,
						store_group_id: res.data.store_group_id,
						sid: res.data.id
					})
				}
				// else {
				// 	wx.showToast({
				// 		title: res.msg,
				// 		icon: 'none'
				// 	})
				// }
			}
		})
	},
	getShareImg() {
		getApp().request({
			url: getApp().api.default.vip_share_img,
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						shareImg: res.data.vipImg
					})
				}
			}
		})
	},
	shareVip() {
		getApp().request({
			url: getApp().api.default.share_vip,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {}
		})
	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function(options) {
		var mch_id = wx.getStorageSync('_mchInfo').id;
		var user_id = getApp().core.getStorageSync('USER_INFO').id
		var nickname = getApp().core.getStorageSync('USER_INFO').nickname
		var img = this.data.shareImg
		this.shareVip()
		var title = nickname + ' 送你一张超值会员卡，大家一起省钱啊，感恩～'
		return {
			title: title,
			path: '/member/getVipCard/getVipCard?sid=' + this.data.sid + '&type=1' + '&mch_id=' + mch_id + '&user_id=' +
				user_id + '&share_vip_type=1',
			imageUrl: img
		}
	}
})
