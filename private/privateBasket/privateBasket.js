// pages//private/privateBasket/privateBasket.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		x: getApp().core.getSystemInfoSync().windowWidth,
		y: getApp().core.getSystemInfoSync().windowHeight,
		is_tips: false,
		isAgreeInvite: false,
		way: [],
		wayIns: 0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.getAdAndSetting()
		if(options.type == 1) {
			this.getCartList()
		} else {
			var cartList = []
			cartList[0] = {}
			cartList[0].goods_name = options.goods_name
			cartList[0].goods_id = options.goods_id
			cartList[0].cart_num = options.num
			cartList[0].first_cover_pic = options.goods_pic
			cartList[0].goods_price = options.goods_price
			cartList[0].is_sel = 1
			this.setData({
				cartList: cartList
			})
			this.totalPrice()
		}
		this.getLastZT()
		
	},
	openTips() {
		this.setData({
			is_tips: true
		})
	},
	closeTips() {
		this.setData({
			is_tips: false
		})
	},
	changeWay(e) {
		var index = e.currentTarget.dataset.index
		var text = e.currentTarget.dataset.text
		var wayText = ''
		if(text == '配送') {
			wayText = true
			this.getDefaultAddress()
		} else {
			wayText = false
			this.getPickUpAddress()
		}
		this.setData({
			wayIns: index,
			wayText: wayText
		})
	},
	bindName (e) {
		this.setData({
			zt_name: e.detail.value
		})
	},
	bindTel (e) {
		this.setData({
			zt_mobile: e.detail.value
		})
	},
	getCartList() {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_cart,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				is_sel: 1
			},
			success(res) {
				if (res.code == 0) {
					self.setData({
						cartList: res.data
					})
					self.totalPrice()
				}
			}
		})
	
	},
	totalPrice() {
		var self = this
		var cartList = self.data.cartList
		var total_num = 0
		var total_price = 0
		for (var i in cartList) {
			if (cartList[i].is_sel == 1) {
				total_price += cartList[i].cart_num * cartList[i].goods_price
				total_num += parseInt(cartList[i].cart_num)
			}
		}
		self.setData({
			total_price: total_price,
			total_num: total_num
		})
	},
	getDefaultAddress () {
		var address_id = ''
		var id = getApp().core.getStorageSync(getApp().const.PICKER_ADDRESS).id;
		if (id) {
			address_id = id
		} 
		getApp().request({
			url: getApp().api.selfSupport.get_default_address,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				address_id: address_id
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						addressObj: res.data,
						address_id: res.data.id
					})
				} else {
					// wx.showModal({
					// 	title: res.msg,
					// 	showCancel: false,
					// })
				}
			}
		})
	},
	getPickUpAddress () {
		var self = this
		var pickId = getApp().core.getStorageSync('PICK_ID')
		var id = ''
		if (pickId) {
			id = pickId
		}
		getApp().core.showLoading({
			title: "正在加载",
			mask: true,
		});
		getApp().request({
			url: getApp().api.selfSupport.get_address_data,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				id: id,
			},
			success: function(res) {
				getApp().core.hideLoading();
				if (res.code == 0) {
					self.setData({
						pickUpObj: res.data,
						address_id: res.data.address_id
					})
				}
			}
		});
	},
	getLastZT () {
		getApp().request({
			url: getApp().api.selfSupport.last_zt,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						zt_name: res.data.name,
						zt_mobile: res.data.mobile
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
	getTipsMsg () {
		getApp().request({
			url: getApp().api.selfSupport.get_zy_article,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				type: 2
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						safeTips: res.data.content,
					});
				}
				if (res.code == 1) {
					wx.showModal({
						title: res.msg,
						showCancel: false,
						success: (res) => {
							if(res.confirm) {
								wx.navigateBack()
							}
						}
					})
				}
			}
		})
	},
	getAdAndSetting () {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_my_shop,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success(res) {
				if (res.code == 0) {
					var expressSet = res.data.expressSet
					var way = []
					var wayText
					for (var i in expressSet) {
						if(expressSet[i].indexOf('2')>-1) {
							way.push('配送')
							wayText = true
							self.getDefaultAddress()
						}
						if(expressSet[i].indexOf('1')>-1) {
							way.push('自提')
						}
					}
					self.setData({
						way: way,
						wayText: wayText
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
	agreeInvite: function() {
		var self = this
		self.setData({
			isAgreeInvite: !self.data.isAgreeInvite
		})
	},
	agreeJoin () {
		if (this.data.isAgreeInvite) {
			getApp().core.setStorageSync('_isPay','true')
		}
		this.submitNewOrder()
	},
	preSubmit () {
		if (getApp().core.getStorageSync('_isPay')) {
			this.submitNewOrder()
		} else {
			this.openTips()
		}
		if (!this.data.safeTips) {
			this.getTipsMsg()
		}
	},
	submitNewOrder () {
		
		var wayText = this.data.wayText
		var express_set = ''
		if (wayText) {
			express_set = '2'
		} else {
			express_set = '1'
		}
		var data_list = this.data.cartList
		for (var i in data_list) {
			data_list[i].num = data_list[i].cart_num
		}
		getApp().request({
			url: getApp().api.selfSupport.add_order,
			method: 'POST',
			data: {
				express_set: express_set,
				address_id: this.data.address_id,
				zt_name: this.data.zt_name || '',
				zt_mobile: this.data.zt_mobile || '',
				data_list:JSON.stringify(data_list)
			},
			success: (res) => {
				if (res.code == 0) {
					this.payOrder(res.data.id)
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			}
		})
	},
	payOrder (id) {
		getApp().request({
			url: getApp().api.selfSupport.pay_data,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				pay_type: 1,
				id: id
			},
			success: (res) => {
				if (res.code == 0) {
					getApp().core.requestPayment({
					    _res: res,
					    timeStamp: res.data.timeStamp,
					    nonceStr: res.data.nonceStr,
					    package: res.data.package,
					    signType: res.data.signType,
					    paySign: res.data.paySign,
					    success: function(e) {},
					    fail: function(e) {},
					    complete: function(e) {
					
					        if (e.errMsg == "requestPayment:fail" || e.errMsg == "requestPayment:fail cancel") { //支付失败转到待支付订单列表
					            getApp().core.showModal({
					                title: "提示",
					                content: "订单尚未支付",
					                showCancel: false,
					                confirmText: "确认",
					                success: function(res) {
					                    if (res.confirm) {
					                        getApp().core.redirectTo({
					                            url: "/private/privateOrder/privateOrder" ,
					                        });
					                    }
					                }
					            });
					            return;
					        }
					
					        getApp().core.redirectTo({
					            url: "/private/privateOrder/privateOrder" ,
					        });
					
					
					    },
					});
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
						success: (res) => {
							getApp().core.redirectTo({
							    url: "/private/privateOrder/privateOrder" ,
							});
						}
					})
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
		if (this.data.wayText) {
			this.getDefaultAddress()
		} else {
			this.getPickUpAddress()
		}
		
		
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
