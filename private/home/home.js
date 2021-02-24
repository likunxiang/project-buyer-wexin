// pages//private/home/home.js
var gSpecificationsModel = require('../../components/goods/specifications_model.js'); //商城多规格选择
var share = require('../../components/share/share.js'); 
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		x: getApp().core.getSystemInfoSync().windowWidth,
		y: getApp().core.getSystemInfoSync().windowHeight,
		tabCur: 0,
		mainCur: 0,
		verticalNavTop: 0,
		load: true,
		is_moreAD: false,
		isInvite: false,
		pageType: 'private',
		show_attr_picker: false,
		page: 1,
		share_modal_active: '',
		goods_qrcode_active: '',
		role: getApp().core.getStorageSync('role'),
		share_type: 'onlyCode'
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		if (getApp().core.getStorageSync('USER_INFO')) {
			this.setData({
				is_login: false,
				role: getApp().core.getStorageSync('role'),
				mch: getApp().core.getStorageSync('_mchInfo'),
			})
		} else {
			this.setData({
				is_login: true
			})
		}
		getApp().page.onLoad(this, options);
		wx.hideShareMenu()
		wx.showLoading({
			title: '加载中...',
			mask: true
		});

		if (options.type == 2) {
			this.setData({
				type: 2
			})
		} else {
			this.setData({
				type: 1
			})
		}
		this.getAdAndSetting()
		if (!getApp().core.getStorageSync('_isInvite')) {
			this.getTipsMsg()
			this.setData({
				isInvite: true
			})
		} else {
			this.setData({
				isInvite: false
			})
		}
	},

	// 获取店主商品列表
	getGoodsList() {
		var self = this
		if (self.data.type == 1) {
			var url = getApp().api.selfSupport.get_goods_list_user // 用户端
			var data = {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				cat_id: self.data.cat_id || '',
				cart_sum_show: true
			}
		} else {
			var url = getApp().api.selfSupport.get_goods_list // 店主端
			var data = {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				cat_id: self.data.cat_id || '',
				cart_sum_show: true,
				status: 1
			}
		}
		wx.showLoading({
			title: '加载中...',
			mask: true
		});
		getApp().request({
			url: url,
			data: data,
			success(res) {
				if (res.code == 0) {
					self.setData({
						goodsList: res.data.list
					})
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			},
			complete: (res) => {
				wx.hideLoading()
				wx.stopPullDownRefresh()
			}
		})
	},
	getCartNum() {
		getApp().request({
			url: getApp().api.selfSupport.get_cart_num,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						cartNum: res.data
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
	copyText() {
		var text = this.data.wx_mobile
		wx.makePhoneCall({
			phoneNumber: text
		})

		// wx.setClipboardData({
		// 	data: text,
		// 	success(res) {
		// 		wx.showToast({
		// 			title: '手机已复制，快去联系吧',
		// 			duration: 3000,
		// 			icon: 'none'
		// 		})
		// 		wx.getClipboardData({
		// 			success(res) {

		// 			}
		// 		})
		// 	}
		// })
	},
	getAdAndSetting() {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_my_shop,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success(res) {
				if (res.code == 0) {

					if (res.data.ad.length > 52) {
						var text = res.data.ad.substring(0, 52) + "...";
						self.setData({
							showgg: text
						})
					} else {
						var text = res.data.ad
						self.setData({
							showgg: text
						})
					}
					self.setData({
						ad: res.data.ad,
						wx_mobile: res.data.wx_mobile,
						ad_img: res.data.cover_pic_arr,
						ad_address: res.data.address,
						ad_mobile: res.data.mobile,
						ad_name: res.data.name,
						nowStatus: res.data.nowStatus
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
	getCatList() {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_cat_list,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success(res) {
				if (res.code == 0) {
					var classifyList = res.data
					self.setData({
						list: classifyList,
						listCur: classifyList[0] || '',
						cat_id: classifyList[0]?classifyList[0].id:'',
					})
					self.getGoodsList()
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}

			}
		})
	},
	
	setTop(e) {
		var self = this
		var id = e.currentTarget.dataset.id
		getApp().request({
			url: getApp().api.selfSupport.set_goods_top,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				id: id,
			},
			success(res) {
				if (res.code == 0) {
					wx.showToast({
						title: res.msg,
						icon: 'none'
					})
					self.getGoodsList()
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			}
		})
	},
	moreAD() {
		if (this.data.is_moreAD) {
			var text = this.data.ad.substring(0, 52) + "...";
			this.setData({
				is_moreAD: false,
				showgg: text
			})
		} else {
			this.setData({
				is_moreAD: true,
				showgg: this.data.ad
			})
		}
	},
	// 加
	addNum(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var price = e.currentTarget.dataset.price
		var goodsNum = self.data.goodsList[index].cart_num
		goodsNum = +goodsNum + 1
		self.setData({
			['goodsList[' + index + '].cart_num']: goodsNum
		})
		self.editCartNum(id, goodsNum, price)
	},
	reduceNum(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var price = e.currentTarget.dataset.price
		var goodsNum = self.data.goodsList[index].cart_num
		goodsNum = +goodsNum - 1
		self.setData({
			['goodsList[' + index + '].cart_num']: goodsNum
		})
		self.editCartNum(id, goodsNum, price)
	},
	editCartNum(id, num, price) {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.edit_cart,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				num: num,
				goods_id: id,
				price: price
			},
			success(res) {
				if (res.code == 0) {
					self.getCartNum()
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			}
		})
	},
	TabSelect(e) {
		var tabCur = e.currentTarget.dataset.id;
		var mainCur = e.currentTarget.dataset.id;
		var cid = e.currentTarget.dataset.cid;
		var verticalNavTop = (e.currentTarget.dataset.id - 1) * 50
		this.setData({
			tabCur: tabCur,
			mainCur: mainCur,
			verticalNavTop: verticalNavTop,
			cat_id: cid
		})
		this.getGoodsList()
	},
	VerticalMain(e) {
		let that = this;
		let tabHeight = 0;
		if (this.data.load) {
			for (let i = 0; i < this.data.list.length; i++) {
				let view = wx.createSelectorQuery().select("#main-" + this.data.list[i].id);
				view.fields({
					size: true
				}, data => {
					this.data.list[i].top = tabHeight;
					tabHeight = tabHeight + data.height;
					this.data.list[i].bottom = tabHeight;
				}).exec();
			}
			this.data.load = false
		}
		let scrollTop = e.detail.scrollTop + 10;
		for (let i = 0; i < this.data.list.length; i++) {
			if (scrollTop > this.data.list[i].top && scrollTop < this.data.list[i].bottom) {
				var verticalNavTop = (this.data.list[i].id - 1) * 50
				var tabCur = this.data.list[i].id
				this.setData({
					verticalNavTop: verticalNavTop,
					tabCur: tabCur
				})
				return false
			}
		}
	},
	openInvite: function() {
		var self = this
		self.setData({
			isInvite: true
		})
	},
	closeInvite: function() {
		var self = this
		self.setData({
			isInvite: false
		})
	},
	agreeInvite: function() {
		var self = this
		self.setData({
			isAgreeInvite: !self.data.isAgreeInvite
		})
	},
	agreeJoin: function() {
		var self = this
		if (!self.data.isAgreeInvite) {
			wx.showToast({
				title: '请先同意约定',
				duration: 2500,
				icon: 'none'
			})
			return
		}
		getApp().core.setStorageSync('_isInvite', 'true')
		self.closeInvite()
	},
	getTipsMsg() {
		getApp().request({
			url: getApp().api.selfSupport.get_zy_article,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				type: 1
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						importanceTips: res.data.content,
						fwxy_id: res.data.user_fwxy
					});
				}
				if (res.code == 1) {
					wx.showModal({
						title: res.msg,
						showCancel: false,
						success: (res) => {
							if (res.confirm) {
								wx.navigateBack()
							}
						}
					})
				}
			}
		})
	},
	showAttrPicker: function(e) {
		var self = this

		self.setData({
			show_attr_picker: true,
		});
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {
		wx.hideLoading()
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		gSpecificationsModel.init(this);
		share.init(this)
		this.setData({
			tabCur: 0,
		})
		this.getCartNum()
		this.getCatList()
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
		this.getGoodsList()
		this.setData({
			page: 1,
			stopLoadMore: false,
		})
	},
	getMore() {
		var self = this

		var page = self.data.page
		var index = page
		var data = {
			userId: getApp().core.getStorageSync('USER_INFO').id,
			cat_id: self.data.cat_id || ''
		}
		var url = getApp().api.selfSupport.get_goods_list
		getApp().core.pading(self, url, data, function(res) {
			if (res.data.list.length == 0) {
				self.setData({
					stopLoadMore: true,
				})
				return
			}
			var newGoodList = res.data.list
			var nowGoodList = self.data.goodsList.concat(newGoodList)
			self.setData({
				goodsList: nowGoodList,
			})
		})
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

		var self = this;
		var title = '我的自营小店上新货啦，快进来看看吧～'
		var user_info = getApp().getUser();
		var mch_info = wx.getStorageSync('_mchInfo');
		switch (res.from) {
			case 'button':
				var res = {
					path: "/private/home/home?type=1" + "&user_id=" + user_info.id + "&mch_id=" + mch_info.id,
					title: title,
					imageUrl: self.data.sharePic,
				};
				self.shareModalClose()
				break;
			case 'menu':
				var res = {
					path: "/private/home/home?type=1" + self.data.id + "&user_id=" + user_info.id + "&mch_id=" + mch_info.id,
					title: title,
					imageUrl: self.data.cover_pic[0],
				}
				break;
			default:
				break;
		}

		return res;
	}
})
