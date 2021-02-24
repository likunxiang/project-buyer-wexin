// pages/acitivityPage/acitivityPage.js
var shareWay = require('../../components/share/share.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navList: ['今日必抢', '明日预告'],
		navIns: 0,
		loading: false,
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom,
		share_type: 'code'
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.getList()
	},
	goBack() {
		wx.navigateBack({
			delta: 1,
			fail: (res) => {
				wx.redirectTo({
					url: '/pages/index/index'
				})
			}
		});
	},
	getList: function() {
		var self = this
		wx.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.default.pintuan_list,
			data: {
				mode: 'page'
			},
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						bg: res.data.banner.a,
						ptList: res.data.list,
						minGoodsInfo: res.data.min_goods_info
					});
				}
			},
			complete: function() {
				wx.hideLoading()
				getApp().core.stopPullDownRefresh();
			}
		});
	},
	getMore() {
		var self = this

		var page = self.data.page
		var index = page
		var data = {
			mode: 'page'
		}
		var url = getApp().api.default.miaosha_list
		getApp().core.pading(self, url, data, function(res) {
			if (res.data.list.length == 0) {
				self.setData({
					stopLoadMore: true,
				})
				return
			}
			var newGoodList = res.data.list
			var nowGoodList = self.data.ptList.concat(newGoodList)
			self.setData({
				ptList: nowGoodList,
			})
		})
	},
	getGoodsQrcode: function() {
		var self = this;
		self.setData({
			goods_qrcode_active: "active",
			share_modal_active: "",
		});
		if (self.data.goods_qrcode) {
			return true;
		}
		this.getQrcode()
	},
	getQrcode() {
		var picInfo = this.data.minGoodsInfo
		var end_date = picInfo.end_date
		// 结束时间获取
		var endTime = new Date(end_date * 1000);
		var month = endTime.getMonth() + 1
		if (month < 10) {
			month = '0' + month
		}
		var d = endTime.getDate()
		if (d < 10) {
			d = '0' + d
		}
		var h = endTime.getHours();
		if (h < 10) {
			h = '0' + h
		}
		var m = endTime.getMinutes();
		if (m < 10) {
			m = '0' + m
		}
		var show_end_time = month + '月' + d + '日' + '  ' + h + ':' + m + '结束'
		getApp().request({
			url: getApp().api.default.activity_qrcode,
			data: {
				goods_pic: picInfo.goods_pic,
				act_name: picInfo.act_name,
				price_str: picInfo.price_str,
				end_date: show_end_time,
				activity: picInfo.activity,
				qrcode_type: 13
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						goods_qrcode: res.data.pic_url,
					});
				}
				if (res.code == 1) {
					this.goodsQrcodeClose();
					getApp().core.showModal({
						title: "提示",
						content: res.msg,
						showCancel: false,
						success: function(res) {
							if (res.confirm) {

							}
						}
					});
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
		shareWay.init(this)
		this.getCartNum()
	},
	getCartNum: function() {
		var self = this
		getApp().request({
			url: getApp().api.default.cartCount,
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						cartNum: res.data.count
					})
				}
			}
		})
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
	onShareAppMessage: function(res) {
		var self = this
		var title = '限时秒杀'
		if (res.from === 'button') {
			// 来自页面内转发按钮
			this.shareModalClose()
		}
		return getApp().page.onShareQp(this, '', title);
	}
})
