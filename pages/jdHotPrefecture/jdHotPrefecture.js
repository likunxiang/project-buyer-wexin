// pages/jdHotMenu/jdHotMenu.js
var gSpecificationsModel = require('../../components/goods/specifications_model.js'); //商城多规格选择
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom,
		chooseIns: 0,
		chooseMoreIns: 0,
		moren: '全部品类',
		choose: [], //多选数组
		catsArr: [],
		catalog: [{
			name: '食品饮料',
			id: 0
		}, {
			name: '家居日用',
			id: 1
		}, {
			name: '美妆个护',
			id: 2
		}, {
			name: '零食坚果',
			id: 3
		}, {
			name: '家用电器',
			id: 4
		}, ],
		priceDefault: true,
		priceUp: true,
		is_screen: false,
		showChangeMore: false,
		page: 1,
		pageType: 'normal',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		getApp().page.onLoad(this, options);
		this.getCats()
	},
	getCats: function() {
		var self = this
		var page = self.data.page
		getApp().core.showLoading({
			title: '加载中',
		});
		getApp().request({
			url: getApp().api.default.common_walk_cats,
			success: function(res) {
				if (res.code == 0) {
					getApp().core.hideLoading();
					self.setData({
						catalog: res.data,
						catsArr: res.data[0].child
					})
					if (self.data.catalog.length > 0) {
						var cat_id = self.data.catalog[0].id;
						self.setData({
							cat_id: cat_id
						})
						self.getWalkGoodsList()
					}

				}
			},
			fail: function() {},
			complete: function() {
				getApp().core.stopPullDownRefresh();
			}
		})
	},
	getScreenList: function() {
		var self = this
		var page = self.data.page
		getApp().core.showLoading({
			title: '加载中',
		});
		getApp().request({
			url: getApp().api.default.walk_son_cats,
			data: {
				cat_id: self.data.cat_id,
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
	inputSearch(e) {
		console.log(e.detail.value);
		this.setData({
			searchValue: e.detail.value,
			page: 1,
			stopLoadMore: false,
			is_no_more: false
		})
		this.getWalkGoodsList()
	},
	getWalkGoodsList() {
		var self = this
		getApp().core.showLoading({
			title: '加载中',
		});
		getApp().request({
			url: getApp().api.default.walk_goods_list_JD,
			data: {
				cat_ids: self.data.cat_id,
				sort: self.data.sort || '',
				keyword: self.data.searchValue || '',
				min_price: self.data.minPrice || '',
				max_price: self.data.maxPrice || '',
			},
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						goodList: res.data.list
					})
				}
			},
			complete: function() {
				getApp().core.hideLoading();
				getApp().core.stopPullDownRefresh();
			}

		})
	},
	returnPage() {
		wx.navigateBack({
			delta: 1,
			fail: (res) => {
				wx.redirectTo({
					url: '/pages/index/index'
				})
			}
		})
	},
	changeNav(e) {
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		this.setData({
			chooseIns: index,
			cat_id: id,
			sort: '',
			page: 1,
			stopLoadMore: false,
			is_no_more: false,
			showChangeMore: false,
			moren: '全部品类'
		})
		getApp().core.showLoading({
			title: '加载中'
		})
		this.getWalkGoodsList()
	},
	changeMoreNav: function(e) {
		var id = e.currentTarget.dataset.id
		var name = e.currentTarget.dataset.name
		var index = e.currentTarget.dataset.index


		var num = e.currentTarget.dataset.num
		let newCatArr = this.data.catsArr;
		newCatArr[index].checked = !newCatArr[index].checked;
		var newChooseIns = [];
		var moren = []
		newCatArr.map((item, index) => {
			if (item.checked) {
				newChooseIns.push(item.id)
				moren.push(item.name)
			}
		});
		console.log(newChooseIns);


		// console.log(newChooseIns.join(','))
		this.setData({
			chooseMoreIns: newChooseIns.join(','),
			cat_id: newChooseIns.join(','),
			moren: moren.join(',') ? moren.join(',') : '全部品类',
			priceDefault: true,
			sort: '',
			catsArr: newCatArr,
			page: 1,
			stopLoadMore: false,
			is_no_more: false
		})
		console.log(this.data.cat_id);
		console.log(this.data.moren);
		getApp().core.showLoading({
			title: '加载中'
		})
		this.getWalkGoodsList()
	},
	// 价格排序
	priceSort: function() {
		//多选关闭
		this.setData({
			page: 1,
			stopLoadMore: false,
			is_no_more: false
		})
		let self = this;
		var up = self.data.priceUp
		self.setData({
			priceDefault: false,
			priceUp: !up
		})
		getApp().core.showLoading({
			title: '加载中'
		})
		if (self.data.priceUp == true) {
			self.setData({
				sort: 3,
			})
		} else {
			self.setData({
				sort: 2,
			})
		}
		this.getWalkGoodsList()
	},
	openScreen() {
		this.setData({
			is_screen: true
		})
	},
	stop() {
		return
	},
	closeScreen() {
		this.setData({
			is_screen: false
		})
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
	// 购物车相关
	openCart(e) {
		var id = e.currentTarget.dataset.id
		var index = e.currentTarget.dataset.index
		var goods = this.data.goodList[index]
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
				from: self.data.goods.from ? self.data.goods.from : '1'
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
					from: self.data.goods.from ? self.data.goods.from : '1'
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
	showChange1: function() {
		var chooseIns = this.data.chooseIns
		this.setData({
			showChangeMore: !this.data.showChangeMore,
			catsArr: this.data.catalog[chooseIns].child
		})
	}, //多选关闭
	closeChange: function() {
		this.setData({
			showChangeMore: false
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
		this.getMore()
	},
	// 上拉分页
	getMore() {
		var self = this

		var page = self.data.page
		var index = page
		var data = {
			cat_ids: self.data.cat_id,
			sort: self.data.sort || '',
			keyword: self.data.searchValue || '',
			min_price: self.data.minPrice || '',
			max_price: self.data.maxPrice || '',
		}
		var url = getApp().api.default.walk_goods_list_JD
		getApp().core.pading(self, url, data, function(res, index) {
			if (res.data.list.length == 0) {
				self.setData({
					stopLoadMore: true,
					is_no_more: true
				})
				return
			}
			var newGoodList = res.data.list
			var nowGoodList = self.data.goodList.concat(newGoodList)
			self.setData({
				goodList: nowGoodList,
				loadingSwitch: true
			})
		})
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})
