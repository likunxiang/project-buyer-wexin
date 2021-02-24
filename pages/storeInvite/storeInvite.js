// pages/storeManager/storeManager.js
import utils from '../../utils/util.js'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		loading: false,
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var self = this
		getApp().page.onLoad(this, options);
		var token = getApp().core.getStorageSync('ACCESS_TOKEN')
		if (!token) {
			this.setData({
				showGetLogin: true,
				user_info_show: true,
			})
			return
		}
		this.setData({
			to_mch_img: getApp().core.getStorageSync('_img').tomch_invite,
		})
		setTimeout(function() {
			self.setData({
				loading: true
			})
		}, 500)
		this.getShareData()
		this.getShareImg()
		this.getVipList()
	},
	getVipList() {
		getApp().request({
			url: getApp().api.LockPowder.vip_list,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				only_get: 'member'
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						member: res.data.member,
					})
				}
			}
		})
	},
	buyVipOrderThrottle: utils.throttle(function() {
		this.buyVipOrder()
	}, 1000),
	// 生成购买会员订单
	buyVipOrder() {
		getApp().request({
			url: getApp().api.default.vip_buy_order,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				type: 2 // 1购买会员，2成为小亲
			},
			success: (res) => {
				if (res.code == 0) {
					var order_id = res.data.id
					getApp().request({
						url: getApp().api.default.vip_pay_data,
						data: {
							id: order_id,
							pay_type: 1,
							parent_id: this.data.parent_id || getApp().core.getStorageSync('parent_id') || getApp().core.getStorageSync('u_id') || ''
						},
						success: (res) => {
							if (res.code == 0) {
								wx.requestPayment({
									timeStamp: res.data.timeStamp,
									nonceStr: res.data.nonceStr,
									package: res.data.package,
									signType: res.data.signType,
									paySign: res.data.paySign,
									success(res) {},
									fail(res) {},
									complete: (e) => {
										if (e.errMsg == "requestPayment:fail" || e.errMsg == "requestPayment:fail cancel") { //支付失败转到待支付订单列表
											getApp().core.showModal({
												title: "提示",
												content: "订单尚未支付",
												showCancel: false,
												confirmText: "确认",
												success: function(res) {}
											});
											return;
										}
										if (e.errMsg == "requestPayment:ok") {
											getApp().core.showModal({
												title: "提示",
												content: "成功开通会员",
												showCancel: false,
												confirmText: "确认",
												success: function(res) {
													wx.redirectTo({
														url: '/pages/index/index'
													})
												}
											});
										}
									}
								})
							} else {
								wx.showToast({
									title: res.msg,
									icon: 'none'
								})
							}
						}
					})
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
						success: (res) => {
							wx.redirectTo({
								url: '/pages/index/index'
							})
						}
					})
				}
			}
		})
	},
	goBack() {
		wx.navigateBack({
			fail: (res) => {
				wx.redirectTo({
					url: '/pages/index/index'
				})
			}
		})
	},
	// 支付
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
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
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
			success: (res) => {
			}
		})
	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {
		var mch_id = wx.getStorageSync('_mchInfo').id;
		var user_id = getApp().core.getStorageSync('USER_INFO').id
		var nickname = getApp().core.getStorageSync('USER_INFO').nickname
		var title = nickname + ' 送你一张超值会员卡，大家一起省钱啊，感恩～'
		var img = this.data.shareImg
		this.shareVip()
		return {
			title: title,
			path: '/member/getVipCard/getVipCard?sid=' + this.data.sid + '&type=1' + '&mch_id=' + mch_id + '&user_id=' + user_id + '&share_vip_type=1',
			imageUrl: img
		}
	}
})
