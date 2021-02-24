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
		wx.hideShareMenu()
		this.setData({
			to_mch_img: getApp().core.getStorageSync('_img').tomch,
		})
		setTimeout(function() {
			self.setData({
				loading: true
			})
		}, 500)
		this.getSuperiorInfo()
		this.getShareData()
		this.getShareImg()
	},
	getSuperiorInfo() {
		getApp().request({
			url: getApp().api.default.get_superior_info,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData(res.data)
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			}
		})
	},
	copy: function(e) {
		var text = e.currentTarget.dataset.text
		wx.setClipboardData({
			data: text,
			success(res) {
				wx.getClipboardData({
					success(res) {
	        wx.showToast({
	          title: '已复制成功，前往微信添加好友',
	          icon:'none'
	         
	        })
					}
				})
			}
		})
	},
	saveImg() {
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
	
		getApp().core.downloadFile({
			url: self.data.wechat_qr_pic,
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
							content: '二维码保存成功',
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
					content: e.errMsg + ";" + self.data.wechat_qr_pic,
					showCancel: false,
				});
			},
			complete: function(e) {
				getApp().core.hideLoading();
			}
		});
	},
	// getVipList() {
	// 	getApp().request({
	// 		url: getApp().api.LockPowder.vip_list,
	// 		data: {
	// 			userId: getApp().core.getStorageSync('USER_INFO').id,
	// 			only_get: 'member'
	// 		},
	// 		success: (res) => {
	// 			if (res.code == 0) {
	// 				this.setData({
	// 					member: res.data.member,
	// 				})
	// 			}
	// 		}
	// 	})
	// },
	// 生成购买会员订单
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
