var gSpecificationsModel = require('../../components/goods/specifications_model.js'); //商城多规格选择
var shareWay = require('../../components/share/share.js');
var toTop = require('../../components/toTop/toTop.js')
Page({

	/**
	 * 页面的初始数据d
	 */
	data: {
		x: getApp().core.getSystemInfoSync().windowWidth,
		y: getApp().core.getSystemInfoSync().windowHeight,
		chooseOpen: false,
		moren: '全部产品',
		cartNum: 0,
		discountDefault: true,
		priceDefault: true,
		discountUp: true,
		priceUp: true,
		cat_id: '',
		page: 1,
		count: 0,
		goodList: [],
		goodListMsg: [],
		chooseText: '',
		chooseIns: 0,
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom,
		pageType: 'normal',
		share_type: 'code',
		is_top: false,
		brand_id:'',//品牌id
		brand_name:'',//品牌name
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var self = this;
		getApp().page.onLoad(self, options);
		toTop.init(this)
		if (options.scene && getApp().core.getStorageSync('s_id')) {
			getApp().request({
				url: getApp().api.default.get_share_info,
				data: {
					sid: getApp().core.getStorageSync('s_id')
				},
				success: (res) => {
					if (res.code == 0) {
						
						if (res.data.rel_id) {
							options.brand_id = res.data.rel_id
							this.setData({
								brand_id: options.brand_id,
							})
							getApp().core.showLoading({
								title: '加载中'
							})
							this.loadData(options);
							this.getWalkGoodsList()
						}
					} else {
						wx.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				}
			})
		} else {
			this.setData({
				brand_id: options.brand_id,
			})
			getApp().core.showLoading({
				title: '加载中'
			})
			this.loadData(options);
			this.getWalkGoodsList()
		}
		
		
		// wx.setNavigationBarTitle({
		// 	title:options.name
		// })
	},
	openChoose: function() {
		var self = this
		this.setData({
			chooseOpen: !self.data.chooseOpen,
		})

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
	chooseAll: function() {
		var self = this
		var catsArr = self.data.cat
		var arr = []
		for (let i in catsArr) {

			catsArr[i].checked = false

		}
		self.setData({
			cat: catsArr,
			chooseIns: 0,
			cat_id: '',
			priceDefault: true,
			is_no_more: false
		})
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({

			url: getApp().api.default.brand_list,
			data: {
				brand_id: self.data.brand_id,
			},
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						goodList: res.data.list.list,
						count: res.data.list.row_count,
						page: 1
					})
				}
			},
			complete: function() {
				getApp().core.hideLoading()
			}
		})
	},
	brandAttention() {
		var userId = getApp().core.getStorageSync('USER_INFO').id
		if (!userId) {
			wx.showToast({
				title: '请先登录',
				icon: 'none'
			})
		} else {
			getApp().request({
				url: getApp().api.default.add_brand,
				method: 'POST',
				data: {
					brand_ids: this.data.brand_id || '',
					user_ids: userId,
				},
				success: (res) => {
					if (res.code == 0) {
						wx.showToast({
							icon: 'none',
							title: '添加成功'
						})
					}
				}
			})
		}
	},
	toSearch: function() {
		wx.navigateTo({
			url: '/pages/allseach/allseach'
		})
	},
	toBrandDetail: function() {
		var self = this
		wx.navigateTo({
			url: '/pages/brandDetails/brandDetails?brand_id=' + self.data.brand_id
		})
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
		var self = this
		var list = self.data.brand.min_goods_info
		var activityMsg = self.data.brand
		var activity_name = activityMsg.name
		var imgUrl = list.first_cover_pic
		var tmpprice = list.price
		// 结束时间获取

		var data = {
			goods_pic: imgUrl,
			act_name: activity_name,
			price_str: tmpprice,
			activity: self.data.brand_id,
			page_url: 'pages/brand/brand',
			sidFsShare: 1
		}
		getApp().request({
			url: getApp().api.default.activity_qrcode,
			data: data,
			success: function(res) {
				if (res.code == 0) {

					self.setData({
						goods_qrcode: res.data.pic_url
					})

				}
			}
		})
	},
	onShow: function() {
		this.getCartNum()
		gSpecificationsModel.init(this);
		shareWay.init(this);
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
	loadData: function(options) {
		let self = this;
		getApp().request({
			url: getApp().api.default.brand_list,
			data: {
				brand_id: self.data.brand_id,
			},
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						brand: res.data,
						brand_name:res.data.name,
						brand_id:res.data.id
					})
				};
			},
			complete: function() {
				getApp().core.hideLoading()
				getApp().core.stopPullDownRefresh();
			}
		});
	},
	getWalkGoodsList() {
		var self = this
		getApp().core.showLoading({
			title: '加载中',
		});
		getApp().request({
			url: getApp().api.default.walk_goods_list,
			data: {
				brand_id: self.data.brand_id,
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
		getApp().request({
			url: getApp().api.default.walk_goods_rec,
			data: {
				brand_id: self.data.brand_id,
				position: 3 // 1->商品详情页推荐， 2->购物车推荐， 3->品牌主页推荐
			},
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						hotSaleList: res.data.list
					})
				}
			},
			complete: function() {
				getApp().core.stopPullDownRefresh();
			}
		})
	},
	// 价格排序
	priceSort: function() {

		let self = this;
		var up = self.data.priceUp
		self.setData({
			priceDefault: false,
			discountDefault: true,
			priceUp: !up
		})
		getApp().core.showLoading({
			title: '加载中'
		})
		if (self.data.priceUp == true) {
			self.setData({
				sort: 'price',
				by: 'desc'
			})
			getApp().request({
				url: getApp().api.default.walk_goods_list,
				data: {
					brand_id: self.data.brand_id,
					cat_id: self.data.cat_id,
					sort: 3,
					by: self.data.by
				},
				success: function(res) {
					if (res.code == 0) {
						self.setData({
							goodList: res.data.list
						})
					};
				},
				complete: function() {
					getApp().core.hideLoading()
				}
			});
		} else {
			self.setData({
				sort: 'price',
				by: 'asc'
			})
			getApp().request({
				url: getApp().api.default.walk_goods_list,
				data: {
					brand_id: self.data.brand_id,
					cat_id: self.data.cat_id,
					sort: 2,
					by: self.data.by
				},
				success: function(res) {
					if (res.code == 0) {

						self.setData({
							goodList: res.data.list
						})
					};
				},
				complete: function() {
					getApp().core.hideLoading()
				}
			});
		}

	},
	onReachBottom() {
		var self = this

		var page = self.data.page
		var index = page
		var data = {
			brand_id: self.data.brand_id,
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
			var nowGoodList = self.data.goodList.concat(newGoodList)
			self.setData({
				goodList: nowGoodList,
			})
		})

	},
	// 复制标题
	copy: function(e) {
		var text = e.currentTarget.dataset.text
		wx.setClipboardData({
			data: text,
			success(res) {
				wx.getClipboardData({
					success(res) {

					}
				})
			}
		})
	},
	changeNav: function(e) {
		let index = e.currentTarget.dataset.index;
		this.setData({
			chooseIns: index,
			priceDefault: true,
		});
		getApp().core.showLoading({
			title: '加载中'
		})

		getApp().request({
			url: getApp().api.default.brand_list,
			data: {
				brand_id: this.data.brand_id,
				cat_id: index,

			},
			success: (res) => {
				getApp().core.hideLoading()
				if (res.code == 0) {

					this.setData({
						goodList: res.data.list.list,
						count: res.data.list.row_count,
						page: 1
					})
				};
			}
		});
	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function(res) {
		var self = this;
		self.shareModalClose()
		var user_info = getApp().core.getStorageSync(getApp().const.USER_INFO);
		var mch_id = wx.getStorageSync('_mchInfo').id;
		if (res.from === 'button') {
			if (res.target.dataset.id) {
				var path = 'id=' + res.target.dataset.id;
				var title = self.data.brand.name;
				var imageUrl = res.target.dataset.image;
			} else {
				var path = "brand_id=" + self.data.brand_id;
				var imageUrl = res.target.dataset.image;
				var title = self.data.brand.name;
			}
		} else {
			var path = "brand_id=" + self.data.brand_id;
			var imageUrl = self.data.brand.background;
			var title = self.data.brand.name;
		}
		return getApp().page.onShareQp(this, path, title);
	},
	buyShop: function(e) {
		var user_info = getApp().core.getStorageSync(getApp().const.USER_INFO);
		getApp().core.redirectTo({
			url: '/pages/goods/goods?id=' + e.currentTarget.dataset.id + '&user_id=' + user_info.id
		})
	},
	doNothing: function() {
		return
	},
	onPageScroll: function(e) {
		var self = this;
		var top = e.scrollTop
		var touchTop = top + 300
		if (top >= 600 && !self.data.is_top) {
			self.setData({
				is_top: true
			})
		}
		if (top < 600 && self.data.is_top) {
			self.setData({
				is_top: false
			})
		}
	},
	onPullDownRefresh: function() {
		var self = this
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.default.brand_list,
			data: {
				brand_id: self.data.brand_id,
				cat_id: self.data.cat_id || '',
				page: 1
			},
			success: function(res) {
				if (res.code == 0) {

					self.setData({
						goodListMsg: res.data,
						goodList: res.data.list.list,
						count: res.data.list.row_count,
						brand: res.data.brand,
						cat: res.data.cat,
						page: 1,
						sort: '',
						by: '',
						discountDefault: true,
						priceDefault: true,
						is_no_more: false
					})
				};
			},
			complete: function() {
				getApp().core.hideLoading()
				getApp().core.stopPullDownRefresh();
			}
		});
	}
});
