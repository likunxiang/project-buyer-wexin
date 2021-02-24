// pages/hotRecommend/hotRecommend.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		share_modal_active: '',
		goods_qrcode_active: '',
		moren: '全部品类',
		priceDefault: true,
		priceUp: true,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {

	},
	showShareModal: function() {
		var self = this
		self.setData({
			share_modal_active: "active",
			no_scroll: true,
		});
	},
	shareModalClose: function() {
		var self = this
		self.setData({
			share_modal_active: "",
			no_scroll: false,
		});
	},
	showShareModal: function() {
		var self = this;
		var token = getApp().core.getStorageSync('ACCESS_TOKEN')
		if (!token) {
			self.setData({
				showGetLogin: true,
				user_info_show: true,
			})
			return
		}
		self.setData({
			share_modal_active: "active",
			is_commission: false,
			no_scroll: true,
		});
		self.getSharePic();
	},
	shareModalClose: function() {
		var self = this;
		self.setData({
			share_modal_active: "",
			no_scroll: false,
			is_commission: true,
		});
	},
	getSharePic: function() {
		var self = this;
		var goods = self.data.goods
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.selfSupport.share_goods_qrcode,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				type: 'mch'
			},
			success: function(res) {
				if (res.code == 0) {
					getApp().core.hideLoading()
					self.setData({
						sharePic: res.data.pic_url
					})
				}
				if (res.code == 1) {
					getApp().core.hideLoading()
					wx.showToast({
						title: '卡片图片获取失败，请稍后再试',
						duration: 2500,
						icon: 'none'
					})
					self.setData({
						is_commission: true
					})
				}
			},
			fail: function() {
				getApp().core.hideLoading()
				wx.showToast({
					title: '网络错误，请稍后再试',
					duration: 2500,
					icon: 'none',
				})
				self.setData({
					is_commission: true
				})
			}
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
	goodsQrcodeClose: function() {
		var self = this;
		self.setData({
			goods_qrcode_active: "",
			no_scroll: false,
		});
	},
	
	saveGoodsQrcode: function() {
		var self = this;
		if (!getApp().core.saveImageToPhotosAlbum) {
			// 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
			getApp().core.showModal({
				title: '提示',
				content: '当前版本过低，无法使用该功能，请升级到最新版本后重试。',
				showCancel: false,
			});
			return;
		}
	
		getApp().core.showLoading({
			title: "正在保存图片",
			mask: false,
		});
	
		getApp().core.downloadFile({
			url: self.data.goods_qrcode,
			success: function(e) {
				getApp().core.showLoading({
					title: "正在保存图片",
					mask: false,
				});
				getApp().core.saveImageToPhotosAlbum({
					filePath: e.tempFilePath,
					success: function() {
						getApp().core.showModal({
							title: '提示',
							content: '商品海报保存成功',
							showCancel: false,
						});
					},
					fail: function(e) {
						getApp().core.showModal({
							title: '图片保存失败',
							content: e.errMsg,
							showCancel: false,
						});
					},
					complete: function(e) {
						getApp().core.hideLoading();
					}
				});
			},
			fail: function(e) {
				getApp().core.showModal({
					title: '图片下载失败',
					content: e.errMsg + ";" + self.data.goods_qrcode,
					showCancel: false,
				});
			},
			complete: function(e) {
				getApp().core.hideLoading();
			}
		});
	
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
