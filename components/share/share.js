module.exports = {
	currentPage: null,
	init: function(self) {
		var _this = this;
		_this.currentPage = self;
		if (typeof self.getQrcode == 'undefined') {
			self.getQrcode = function(e) {
				_this.getQrcode(e);
			}
		}
		if (typeof self.showShareModal == 'undefined') {
			self.showShareModal = function(e) {
				_this.showShareModal(e);
			}
		}
		if (typeof self.shareModalClose == 'undefined') {
			self.shareModalClose = function(e) {
				_this.shareModalClose(e);
			}
		}
		if (typeof self.getSharePic == 'undefined') {
			self.getSharePic = function(e) {
				_this.getSharePic(e);
			}
		}
		if (typeof self.getGoodsQrcode == 'undefined') {
			self.getGoodsQrcode = function(e) {
				_this.getGoodsQrcode(e);
			}
		}
		if (typeof self.goodsQrcodeClose == 'undefined') {
			self.goodsQrcodeClose = function(e) {
				_this.goodsQrcodeClose(e);
			}
		}
		if (typeof self.saveGoodsQrcode == 'undefined') {
			self.saveGoodsQrcode = function(e) {
				_this.saveGoodsQrcode(e);
			}
		}
		if (typeof self.saveGoodsQrcode == 'undefined') {
			self.saveGoodsQrcode = function(e) {
				_this.saveGoodsQrcode(e);
			}
		}
	},
	getQrcode() {
		var self = this.currentPage;
		getApp().request({
			url: getApp().api.selfSupport.qrcode,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				type: 'mch'
			},
			success: (res) => {
				if (res.code == 0) {
					self.setData({
						goods_qrcode: res.data.pic_url,
					});
				}
				if (res.code == 1) {
					self.goodsQrcodeClose();
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
	showShareModal: function() {
		var self = this.currentPage;
		var token = getApp().core.getStorageSync('ACCESS_TOKEN')
		if (!token) {
			self.setData({
				showGetLogin: true,
				user_info_show: true,
			})
			return
		}
		if (self.getBackground) {
			self.getBackground()
		}
		self.setData({
			share_modal_active: "active",
			is_commission: false,
			no_scroll: true,
		});
		self.getSharePic();
	},
	shareModalClose: function() {
		var self = this.currentPage;
		self.setData({
			share_modal_active: "",
			no_scroll: false,
			is_commission: true,
		});
	},
	getSharePic: function() {
		var self = this.currentPage;
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
	shop () {
		return
	},
	getGoodsQrcode: function() {
		var self = this.currentPage;
		self.setData({
			goods_qrcode_active: "active",
			share_modal_active: "",
		});
		if (self.data.goods_qrcode) {
			return true;
		}
		self.getQrcode()
	},
	goodsQrcodeClose: function() {
		var self = this.currentPage;
		self.setData({
			goods_qrcode_active: "",
			no_scroll: false,
		});
	},

	saveGoodsQrcode: function() {
		var self = this.currentPage;
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
}
