// pages/goodsGrouping/goodsGrouping.js
var gSpecificationsModel = require('../../components/goods/specifications_model.js'); //商城多规格选择
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		priceDefault: true,
		priceUp: true,
		navList: ['全部商品', '鞋子', '配件'],
		navIns: 0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {},
	changeNav(e) {
		var index = e.currentTarget.dataset.index
		this.setData({
			navIns: index
		})
	},

	// 价格排序
	priceSort: function() {
		var self = this
		// getApp().core.showLoading({
		// 	title: '加载中'
		// })
		if (self.data.priceUp) {
			self.setData({
				priceDefault: false,
				priceUp: false,
			})
			// getApp().request({
			// 	url: getApp().api.default.gyg_list,
			// 	data: {
			// 		cat_id: self.data.id,
			// 		s_cat_id: self.data.s_cat_id || '',
			// 		sort: 'price',
			// 		by: 'asc'
			// 	},
			// 	success(res) {
			// 		if (res.code == 0) {
			// 			self.setData({
			// 				goodsList: res.data.list,
			// 				sort: 'price',
			// 				by: 'asc'
			// 			})
			// 		}
			// 	},
			// 	complete(res) {
			// 		getApp().core.hideLoading()
			// 	}
			// })
		} else {
			self.setData({
				priceDefault: false,
				priceUp: true,
			})
			// getApp().request({
			// 	url: getApp().api.default.gyg_list,
			// 	data: {
			// 		cat_id: self.data.id,
			// 		s_cat_id: self.data.s_cat_id || '',
			// 		sort: 'price',
			// 		by: 'desc'
			// 	},
			// 	success(res) {
			// 		if (res.code == 0) {
			// 			self.setData({
			// 				goodsList: res.data.list,
			// 				sort: 'price',
			// 				by: 'desc'
			// 			})
			// 		}
			// 	},
			// 	complete(res) {
			// 		getApp().core.hideLoading()
			// 	}
			// })
		}

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
	onShareAppMessage: function() {

	}
})
