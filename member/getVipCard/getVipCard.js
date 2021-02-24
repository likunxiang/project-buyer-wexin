// pages/getVipCard/getVipCard.js
var gSpecificationsModel = require('../../components/goods/specifications_model.js'); //商城多规格选择
import utils from '../../utils/util.js'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom,
		is_show_modal: true,
		pageType: 'normal',
		received: false, //显示已领取弹框
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
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		getApp().page.onLoad(this, options);
		if (options.type) {
			this.setData({
				type: options.type,
			})
		}
		wx.hideShareMenu()
		var self = this
		if (options.user_id) {
			getApp().core.setStorageSync('u_id', options.user_id)
			self.setData({
				parent_id: options.user_id
			})
			self.doInit(options);
			self.getShareInfo()
		}
		if (options.sid) {
			getApp().core.setStorageSync('s_id', options.sid)
			getApp().page.getServerShareInfo(options, function() {
				self.doInit(options);
				self.getShareInfo()
			})
		} else {
			this.getShareData()
			self.doInit(options);
		}
		var token = getApp().core.getStorageSync('ACCESS_TOKEN')
		if (!token) {
			this.setData({
				showGetLogin: true,
				user_info_show: true,
			})
			return
		}
		///获取领取亲卡状态
		// this.getStatus();

	},
	doInit: function(options) {
		this.getShareImg()
		this.getGoodsList()
		this.getVipCardStatus()
		this.getShareList()
		setInterval(this.timeData, 60000)
	},
	// 购物车相关
	openCart(e) {
		var id = e.currentTarget.dataset.id
		var index = e.currentTarget.dataset.index
		var goods = this.data.vipGoodsList[index]
		goods.price = goods.m_price
		this.setData({
			show_attr_picker: true,
			goods: goods,
			['form.number']: 1
		})
		this.getGoodsAttr(id)
	},
	getGoodsAttr: function(id) {
		var self = this
		getApp().request({
			url: getApp().api.default.goods_attr,
			data: {
				id: id,
				from: self.data.goods.from || 1,
			},
			success: function(res) {
				if (res.code == 0) {
					if (res.data.attr[0].num == 0) {
						for (var i in res.data.attr) {
							if (res.data.attr[i].num > 0) {
								res.data.attr[0].total_num = true
								break;
							}

						}
					}
					self.setData({
						goods_attr: res.data.attr,
						attr_group_list: res.data.attr_group_list,
					});
					if (res.data.attr != null && res.data.attr_group_list != null) {
						self.selectDefaultAttr(res.data);
					}

				}

			}
		})
	},
	//加入购物车
	addCart: function() {
		var self = this
		var token = getApp().core.getStorageSync('ACCESS_TOKEN')
		if (!token) {
			self.setData({
				showGetLogin: true,
				user_info_show: true,
			})
		}
		this.submit('ADD_CART');
	},
	submit: function(type) {
		var self = this
		if (self.data.form.number > self.data.goods.num) {
			getApp().core.showToast({
				title: "商品库存不足，请选择其它规格或数量",
				icon: 'none'
			});
			return true;
		}
		if (type == 'ADD_CART') { //加入购物车
			getApp().core.showLoading({
				title: "正在提交",
				mask: true,
			});
			getApp().request({
				url: getApp().api.cart.add_cart,
				method: "POST",
				data: {
					goods_id: self.data.goods.id,
					sku: self.data.goods.sku,
					num: self.data.form.number,
					from: self.data.goods.from || 1
				},
				success: function(res) {
					getApp().core.hideLoading();
					getApp().core.showToast({
						title: res.msg,
						duration: 1500,
						icon: 'none'
					});
					self.setData({
						show_attr_picker: false,
					});

				}
			});
		}
	},
	buyVipOrderThrottle: utils.throttle(function() {
		this.buyVipOrder()
	}, 1000),
	// 生成购买会员订单 
	buyVipOrder() {
		if (this.data.status == 0) {
			this.showReceived()
			return
		}
		var type = this.data.type
		getApp().request({
			url: getApp().api.default.vip_buy_order,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				type: 1, // 1购买会员，2成为小亲
				bind: type == 1 ? '1' : '',
				parent_id: this.data.parent_id || getApp().core.getStorageSync('parent_id') || getApp().core.getStorageSync(
					'u_id') || ''
			},
			success: (res) => {
				if (res.code == 0) {
					var order_id = res.data.id
					getApp().request({
						url: getApp().api.default.vip_pay_data,
						data: {
							id: order_id,
							pay_type: 1,

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
													if (res.confirm) {
														wx.redirectTo({
															url: '/member/paySucceed/paySucceed'
														})
													}
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
				}
			}
		})
	},
	getVipCardStatus() {
		getApp().request({
			url: getApp().api.default.vip_card_status,
			success: (res) => {
				if (res.code == 0) {

					if (res.data.status == 1 || res.data.status == 2 || res.data.status == 3) {
						var share_type = 0
					} else {
						var share_type = 1
					}
					var type = this.data.type
					if (type == 1) {
						this.setData({
							headerHeight: '144rpx'
						})
					} else {
						if (share_type == 0) {
							this.setData({
								headerHeight: '144rpx'
							})
						} else {
							this.setData({
								headerHeight: '67rpx'
							})
						}
					}
					this.setData({
						status: res.data.status || '0',
						share_type: share_type
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
			}
		})
	},
	getGoodsList() {
		getApp().request({
			url: getApp().api.default.vip_goods_list,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						vipGoodsList: res.data.list
					})
				} else {
					wx.showModal({
						title: res.msg
					})
				}

			}

		})
	},
	getShareList() {
		getApp().request({
			url: getApp().api.default.vip_share_list,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						shareList: res.data.list,
						vipDay: res.data.day,
						endTime: res.data.endTime
					})
					this.timeData()
				} else {
					// wx.showToast({
					// 	title: res.msg,
					// 	icon: 'none'
					// })
				}
			}
		})
	},
	timeData() {
		var endTime = this.data.endTime

		var sd = Math.floor(endTime / 60 / 60 / 24);
		var sh = Math.floor(endTime / 60 / 60 % 24);
		var sm = Math.floor(endTime / 60 % 60);
		if (sd < 10) {
			sd = '0' + sd
		}
		if (sh < 10) {
			sh = '0' + sh
		}
		if (sm < 10) {
			sm = '0' + sm
		}
		if (sd >= '00' && sh >= '00' & sm >= '00') {
			this.setData({
				sd: sd,
				sh: sh,
				sm: sm,
				endTime: endTime - 60,
				daojishi: true
			})
		}
	},
	receiveVip() {
		getApp().request({
			url: getApp().api.default.receive_share_vip,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				parent_id: this.data.parent_id,
				store_group_id: this.data.store_group_id,
				store_id: this.data.store_id
			},
			success: (res) => {
				if (res.code == 0) {
					if (res.data.status == 1) {
						wx.showModal({
							title: res.msg,
							showCancel: false,
							success: (res) => {
								if (res.confirm) {
									wx.redirectTo({
										url: '/pages/index/index'
									})
								}
							}
						})

					} else {
						wx.showModal({
							title: '领取成功',
							showCancel: false,
							success: (res) => {
								if (res.confirm) {
									wx.redirectTo({
										url: '/member/getVipCard/getVipCard'
									})
								}
							}
						})
					}
					if (getApp().core.getStorageSync('u_id')) {
						getApp().core.removeStorageSync('u_id')
					}
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
						shareImg: res.data.vipImg,
						share_step: getApp().core.getStorageSync('_img').share1,
						share_member: getApp().core.getStorageSync('_img').shareMenber
					})
				}
			}
		})
	},
	getShareInfo() {
		getApp().request({
			url: getApp().api.default.vip_get_share_info,
			data: {
				parent_id: this.data.parent_id,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						shareInfo: res.data
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
	goGYG() {
		wx.redirectTo({
			url: '/pages/guanyiguan/guanyiguan'
		})
	},
	showModel() {
		this.setData({
			is_show_model: true,
			card_bg: getApp().core.getStorageSync('_img').b1,
		})
	},
	closeModal() {
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
		gSpecificationsModel.init(this);
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
		var mch_id = wx.getStorageSync('_mchInfo').id;
		var user_id = getApp().core.getStorageSync('USER_INFO').id
		var nickname = getApp().core.getStorageSync('USER_INFO').nickname
		var title = nickname + ' 送你一张超值会员卡，大家一起省钱啊，感恩～'
		var img = this.data.shareImg
		this.shareVip()
		return {
			title: title,
			path: '/member/getVipCard/getVipCard?sid=' + this.data.sid + '&type=1' + '&mch_id=' + mch_id + '&user_id=' +
				user_id + '&share_vip_type=1',
			imageUrl: img
		}
	},
	preventTouchMove: function(e) {

	},
	showReceived: function() {
		this.setData({
			received: true
		})
	},
	closeReceived: function() {
		this.setData({
			received: false
		})
	},
	toIndex: function() {
		wx.redirectTo({
			url: '/pages/index/index',
		})
	},
	// getStatus: function() {
	// 	let self = this;
	// 	getApp().request({
	// 		url: getApp().api.default.get_received_status,
	// 		data: {

	// 		},
	// 		success: function(res) {

	// 			if (res.code == 0) {
	// 				//0 已经是正式会员  1未参加过活动  2，3， 4，5，6，7表示已经参与过活动
	// 				let status = res.data.status;
	// 				let statusArr = [2, 3, 4, 5, 6, 7];
	// 				// console.log(self.data.type,'*****',status)
	// 				if (self.data.type == 1 && statusArr.indexOf(status) != -1) {
	// 					self.setData({
	// 						received: true
	// 					})
	// 				}
	// 			}
	// 			// console.log(res)


	// 		}

	// 	})
	// }
})
