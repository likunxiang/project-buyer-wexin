// pages/guangNavDetail/guangNavDetail.js
var gSpecificationsModel = require('../../components/goods/specifications_model.js'); //商城多规格选择
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		id: 0,
		page: 1,
		priceDefault: true,
		priceUp: true,
		is_sort: false,
		screenIns: 0,
		pageType: 'normal',
		moreSort: '综合排序'
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			id: options.cat_id,
		})
		this.getWalkGoodsList()
		this.getWalkSort()
		this.getCat()
		wx.setNavigationBarTitle({
			title: options.name
		})

	},
	inputSearch(e) {
		this.setData({
			searchValue: e.detail.value,
			page: 1,
		})
		this.getWalkGoodsList()
	},
	//加入购物车
	// 购物车相关
	openCart (e) {
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
					if (res.data.attr[0].num==0) {
						for(var i in res.data.attr) {
							if( res.data.attr[i].num > 0 ) {
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
					from: 4
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
	getCat: function() {
		var self = this
		var page = self.data.page
		getApp().core.showLoading({
			title: '加载中',
		});
		getApp().request({
			url: getApp().api.default.walk_son_cats,
			data: {
				cat_id: self.data.id,
			},
			success: function(res) {
				if (res.code == 0) {
					getApp().core.hideLoading();
					self.setData({
						screenList: res.data
					})
				}
			},
			fail: function() {},
			complete: function() {
				getApp().core.stopPullDownRefresh();
			}
		})
	},
	getWalkGoodsList() {
		var self = this
		getApp().core.showLoading({
			title: '加载中',
		});
		getApp().request({
			url: getApp().api.default.walk_goods_list,
			data: {
				keyword: self.data.searchValue || '',
				min_price: self.data.minPrice || '',
				max_price: self.data.maxPrice || '',
				sort: self.data.sortIns || '',
				cat_ids: self.data.cat_ids || self.data.id
			},
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						goodsList: res.data.list
					})
				}
			},
			complete: function() {
				getApp().core.hideLoading();
				getApp().core.stopPullDownRefresh();
			}

		})
	},
	getWalkSort () {
		getApp().request({
			url: getApp().api.default.walk_goods_sort,
			data: {
				
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						sortList: res.data
					})
				}
			}
		})
	},
	// getGYGList: function() {
	// 	var self = this
	// 	getApp().core.showLoading({
	// 		title:'加载中'
	// 	})
	// 	getApp().request({
	// 		url: getApp().api.default.gyg_list,
	// 		data: {
	// 			cat_id: self.data.id,
	// 			s_cat_id: self.data.s_cat_id || '',
	// 		},
	// 		success: function(res) {

	// 			if (res.code == 0) {
	// 				for (let i in res.data.cats) {
	// 					res.data.cats[i].checked = false
	// 				}
	// 				console.log(res.data.cats);
	// 				self.setData({
	// 					goodsList: res.data.list,
	// 					count: res.data.row_count,
	// 					screenList: res.data.cats
	// 				})
	// 			}
	// 		},
	// 		complete: function() {
	// 			getApp().core.hideLoading()
	// 			getApp().core.stopPullDownRefresh()
	// 		}
	// 	})
	// },
	changeNav: function(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		var arr = self.data.screenList
		arr[index].checked = !arr[index].checked
		self.setData({
			['screenList[' + index + ']']: arr[index],
			priceDefault: true,
			priceUp: true,
		})
	},
	changeSort (e) {
		var sort = e.currentTarget.dataset.sort
		var name = e.currentTarget.dataset.name
		this.setData({
			sortIns: sort,
			moreSort: name,
			page: 1
		})
		this.getWalkGoodsList()
		this.closeSort() 
	},
	inputMinPrice(e) {
		this.setData({
			minPrice: e.detail.value
		})
	},
	inputMaxPrice(e) {
		this.setData({
			maxPrice: e.detail.value
		})
	},
	reset() {
		var arr = this.data.screenList
		for (let i in arr) {
			arr[i].checked = false
		}
		this.setData({
			minPrice: '',
			maxPrice: '',
			screenList: arr
		})
	},
	screenBtn() {
		var arr = this.data.screenList
		var arrId = []

		for (let i in arr) {
			if (arr[i].checked) {
				arrId.push(arr[i].id)
			}
		}
		// var arrIdStr = arrId.toString()
		if (!arrId) {
			wx.showToast({
				title: '请选择分类',
				icon: 'none',
				duration: 2500
			})
			return
		}
		this.setData({
			cat_ids: arrId.toString()
		})
		this.getWalkGoodsList()
		this.closeScreen()
	},
	toCart: function() {
		wx.navigateTo({
			url: '/pages/cart/cart'
		})
	},
	openSort() {
		console.log(this.data.is_sort);
		this.setData({
			is_sort: true
		})
	},
	closeSort() {
		this.setData({
			is_sort: false
		})
	},
	openScreen() {
		this.setData({
			is_screen: true
		})
	},
	stop () {
		return
	},
	closeScreen() {
		this.setData({
			is_screen: false
		})
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {
		var index = 'date' + this.data.navIns
		this.setData({
			toview: index
		})
	},
	// 价格排序
	priceSort: function() {
		var self = this
		getApp().core.showLoading({
			title: '加载中'
		})
		if (self.data.priceUp) {
			self.setData({
				priceDefault: false,
				priceUp: false,
			})
			getApp().request({
				url: getApp().api.default.gyg_list,
				data: {
					cat_id: self.data.id,
					s_cat_id: self.data.s_cat_id || '',
					sort: 'price',
					by: 'asc'
				},
				success(res) {
					if (res.code == 0) {
						self.setData({
							goodsList: res.data.list,
							sort: 'price',
							by: 'asc'
						})
					}
				},
				complete(res) {
					getApp().core.hideLoading()
				}
			})
		} else {
			self.setData({
				priceDefault: false,
				priceUp: true,
			})
			getApp().request({
				url: getApp().api.default.gyg_list,
				data: {
					cat_id: self.data.id,
					s_cat_id: self.data.s_cat_id || '',
					sort: 'price',
					by: 'desc'
				},
				success(res) {
					if (res.code == 0) {
						self.setData({
							goodsList: res.data.list,
							sort: 'price',
							by: 'desc'
						})
					}
				},
				complete(res) {
					getApp().core.hideLoading()
				}
			})
		}

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		this.getCartNum()
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
		var self = this
		this.setData({
			cat_ids: self.data.cat_ids || self.data.id,
			keyword: self.data.searchValue || '',
			sort: self.data.sortIns || '',
			stopLoadMore: false,
			is_no_more: false,
			page: 1,
		})
		this.getWalkGoodsList()
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {
		var self = this

		var page = self.data.page
		var index = page
		var data = {
			cat_ids: self.data.cat_ids || self.data.id,
			min_price: self.data.minPrice || '',
			max_price: self.data.maxPrice || '',
			keyword: self.data.searchValue || '',
			sort: self.data.sortIns || ''
		}
		var url = getApp().api.default.walk_goods_list
		getApp().core.pading(self, url, data, function(res, index) {
			if (res.data.list.length == 0) {
				self.setData({
					stopLoadMore: true,
					is_no_more: true
				})
				return
			}
			var newGoodList = res.data.list
			var nowGoodList = self.data.goodsList.concat(newGoodList)
			self.setData({
				goodsList: nowGoodList,
				loadingSwitch: true
			})
		})
	},

	/**
	 * 用户点击右上角分享
	 */
	// onShareAppMessage: function() {
	// 	return getApp().page.onShareQp(this,)
	// }
})
