// pages/vipList/vipList.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		status: 1,
		page: 1,
		is_show_modal: false,
		shopList: [],
	},

	getVipList() {
		getApp().request({
			url: getApp().api.LockPowder.vip_list,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				page: 1,
				level: this.data.status
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						vipList: res.data,
						list: res.data.list,
					})
				}
			}
		})
	},

	changeVip(e) {
		let status = e.currentTarget.dataset.status;
		this.setData({
			status: status,
			page: 1
		})
		this.getVipList()

	},

	changeFans(e) {
		let status = e.currentTarget.dataset.status;
		this.setData({
			status: status,
			page: 1
		})
		this.getVipList()
	},

	becomeOwner() {
		wx.navigateTo({
			url: '/pages/storeManager/storeManager',
		});
	},

	showModal() {
		this.setData({
			is_show_modal: true
		})
		getApp().request({
			url: getApp().api.LockPowder.exclusive_shop,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res => {
				if (res.code == 0) {
					this.setData({
						shopList: res.data
					})
				}
			})
		})
	},

	closeModal() {
		this.setData({
			is_show_modal: false
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
			url: self.data.shopList.wechat_qr_pic,
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

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		if (options.can_shopkeeper) {
			this.setData({
				can_shopkeeper: options.can_shopkeeper
			})
		}
		this.getVipList(1);
		this.setData({
			share_step: getApp().core.getStorageSync('_img').share2
		})
		this.getShareData()
		this.getShareImg()
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
		var self = this

		var page = self.data.page
		var index = page
		var data = {
			userId: getApp().core.getStorageSync('USER_INFO').id,
			level: this.data.status
		}
		var url = getApp().api.LockPowder.vip_list
		getApp().core.pading(self, url, data, function(res, index) {
			if (res.data.list.length == 0) {
				self.setData({
					stopLoadMore: true,
				})
				return
			}
			var newActList = res.data.list
			var nowActList = self.data.list.concat(newActList)
			self.setData({
				list: nowActList,
			})
		})
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
