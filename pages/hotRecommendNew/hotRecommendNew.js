// pages/acitivityPage/acitivityPage.js
var gSpecificationsModel = require('../../components/goods/specifications_model.js'); //商城多规格选择
var shareWay = require('../../components/share/share.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom,
		share_type: 'code',
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
		this.setData({
			aid: options.aid
		})
		this.loadData()
	},
	loadData: function(options) {
		self = this;
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.default.active_list,
			data: {
				aid: self.data.aid
			},
			success: function(res) {
				getApp().core.hideLoading()
				if (res.code == 0) {
					self.setData({
						bg: res.data.activity.background,
						goodsList: res.data.page.goods,
						minGoodsInfo: res.data.activity.min_goods_info
					})
				}
				if (res.code == 1) {
					wx.showModal({
						content: res.msg,
						icon: 'none',
						complete: function() {
							wx.redirectTo({
								url: '/pages/index/index'
							})
						}
					})
				}
			},
			complete: function(res) {}
		})
	},
	// 购物车相关
	openCart(e) {
		var id = e.currentTarget.dataset.id
		var index = e.currentTarget.dataset.index
		var goods = this.data.goodsList[index]
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
				from: 4
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
			return
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
			url: getApp().api.default.walk_activity_detail,
			data: {
				goods_pic: picInfo.goods_pic,
				act_name: picInfo.act_name,
				price_str: picInfo.price_str,
				end_date: show_end_time,
				activity: picInfo.activity,
				qrcode_type: 15
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
		gSpecificationsModel.init(this);
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
		var title = '爆品返场'
		if (res.from === 'button') {
			// 来自页面内转发按钮
			this.shareModalClose()
		}
		return getApp().page.onShareQp(this, '', title);
	}
})
