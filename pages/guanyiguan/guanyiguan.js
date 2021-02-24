var interval = 0;
var page_first_init = true;
var timer = 1;
var fullScreen = false;
var cat_id = '';
var toTop = require('../../components/toTop/toTop.js')
var gSpecificationsModel = require('../../components/goods/specifications_model.js'); //商城多规格选择
Page({
	data: {
		x: getApp().core.getSystemInfoSync().windowWidth,
		y: getApp().core.getSystemInfoSync().windowHeight,
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom,
		left: 0,
		navHeight: 0,
		scrollTop: 0,
		show_notice: false,
		animationData: {},
		play: -1,
		time: 0,
		buy: false,
		cat_id: cat_id,
		opendate: false,
		navList: [],
		navIns: 0,
		navList2: [],
		todayGoods: [],
		bigNav: [],
		bigNavIns: 1,
		pinpaiList: [],
		showNone: false,
		filterID: 0, //今日推荐那块ID
		page: 1, //页数
		count: 0, //相关内容的总条数
		id: 1, // 活动分类ID
		type_id: 2, // 活动id
		loadingSwitch: true,
		stopLoadMore: false,
		is_top: false,
		classifyIns: 0,
		is_show_classify: false,
		swiperList: [],
		showChangeMore: false, //展示多选按钮
		priceDefault: true,
		newActsList: {}, // 今日推荐活动
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var self = this
		getApp().page.onLoad(this, options)
		// this.loadData(options);
		this.getGYG()
		this.getOldCats()
		toTop.init(this)
		wx.setNavigationBarColor({

			frontColor: "#fff"

		})
		this.getStoreActivityFilter()
		this.getHotSearch()
		this.setData({
			brankLikeImg: getApp().core.getStorageSync('_img').guanzhu_brand
		})
		this.getBuyCatsList()
	},
	BackPage() {
		wx.navigateBack({
			delta: 1
		});
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
	// 删除关注品牌
	delBrandLike(e) {
		var id = e.currentTarget.dataset.id
		wx.showModal({
			content: '关闭展示后之后可到品牌关注中恢复显示',
			showCancel: false,
			success: (res) => {
				if (res.confirm) {
					getApp().request({
						url: getApp().api.default.close_activity,
						method: 'POST',
						data: {
							activity_id: id
						},
						success: (res) => {
							if (res.code == 0) {
								this.getBrandLike()
							}
						}
					})
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
	toGYGDetail: function(e) {
		// url="/pages/guangNavDetail/guangNavDetail?cat_id={{item.id}}"
		var cat_id_detail = e.currentTarget.dataset.id
		var index = e.currentTarget.dataset.index
		var text = e.currentTarget.dataset.text
		var self = this
		var navID = self.data.navIns
		var catalog = self.data.catalog[navID]
		wx.navigateTo({
			url: "/pages/guangNavDetail/guangNavDetail?cat_id=" + cat_id_detail + "&name=" + text
		})

	},
	getGYG: function() {
		var self = this
		var page = self.data.page
		getApp().core.showLoading({
			title: '加载中',
		});
		getApp().request({
			url: getApp().api.default.walk_cats,
			success: function(res) {
				if (res.code == 0) {
					getApp().core.hideLoading();
					self.setData({
						catalog: res.data,
						swiperList: res.data[0].child
					})
					// if (self.data.catalog.length > 0) {
					// 	cat_id = self.data.catalog[0].id;
					// 	self.getActivityFilter(function() {
					// 		var query = wx.createSelectorQuery()
					// 		query.select('#g-header').boundingClientRect(function(res) {
					// 			self.setData({
					// 				headerHeigh: res.height
					// 			})
					// 		}).exec();
					// 	})
					// }

				}
			},
			fail: function() {},
			complete: function() {
				getApp().core.stopPullDownRefresh();
			}
		})
	},
	getOldCats: function() {
		var self = this
		var page = self.data.page
		getApp().core.showLoading({
			title: '加载中',
		});
		getApp().request({
			url: getApp().api.default.walk_old_cats,
			success: function(res) {
				if (res.code == 0) {
					getApp().core.hideLoading();
					self.setData({
						catalog_old: res.data,
					})
					if (self.data.catalog.length > 0) {
						cat_id = self.data.catalog[0].id;
						self.getActivityFilter(function() {
							var query = wx.createSelectorQuery()
							query.select('#g-header').boundingClientRect(function(res) {
								self.setData({
									headerHeigh: res.height
								})
							}).exec();
						})
					}
	
				}
			},
			fail: function() {},
			complete: function() {
				getApp().core.stopPullDownRefresh();
			}
		})
	},
	//  获取关注品牌列表
	getBrandLike() {
		var self = this
		getApp().request({
			url: getApp().api.default.walk_active_list,
			data: {
				is_rec: 1
			},
			success: function(res) {
				if (res.code == 0) {
					getApp().core.hideLoading();
					for (let x in res.data.common) {
						var catsArr = res.data.common[x].cats
						var arr = []
						for (let i in catsArr) {
							var obj = {
								id: i,
								catsName: catsArr[i],
							}
							arr.push(obj)
						}
						res.data.common[x].cats = arr
					}
					self.setData({
						// brandLikeName: res.data.name,
						brandLikeList: res.data.data
					})
				}
			},
			complete: function() {

				getApp().core.stopPullDownRefresh();
			}

		})
	},
	getActivityFilter: function(callback) {
		var self = this
		getApp().core.showLoading({
			title: '加载中',
		});
		getApp().request({
			url: getApp().api.default.walk_active_list,
			data: {
				cat_ids: cat_id,
				is_home: cat_id == 0 ? 1 : ''
			},
			success: function(res) {
				if (res.code == 0) {
					getApp().core.hideLoading();
					for (let x in res.data.common) {
						var catsArr = res.data.common[x].cats
						var arr = []
						for (let i in catsArr) {
							var obj = {
								id: i,
								catsName: catsArr[i],
							}
							arr.push(obj)
						}
						res.data.common[x].cats = arr
					}
					self.setData({
						actName: res.data.name,
						actList: res.data.data
					})
					if (callback) {
						callback()
					}
				}
			},
			complete: function() {

				getApp().core.stopPullDownRefresh();
			}

		})
	},
	getStoreActivityFilter: function() {
		var self = this
		getApp().core.showLoading({
			title: '加载中',
		});
		getApp().request({
			url: getApp().api.default.walk_active_list,
			data: {
				cat_ids: cat_id,
				is_home: cat_id == 0 ? 2 : ''
			},
			success: function(res) {
				if (res.code == 0) {
					getApp().core.hideLoading();
					self.setData({
						actStoreName: res.data.name,
						actStoreList: res.data.data
					})
				}
			},
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
				cat_ids: cat_id,
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
	openClassify: function() {
		var self = this
		self.setData({
			is_show_classify: true
		})
	},
	closeClassify: function() {
		var self = this
		self.setData({
			is_show_classify: false
		})
	},

	getHotSearch() {
		// 获取热搜
		getApp().request({
			url: getApp().api.default.hot_search_nav,
			success: (res) => {
				if (res.code == 0 && res.data.length != 0) {
					this.setData({
						hotSearchList: res.data
					})
				}
			},
			complete: (res) => {
				getApp().core.hideLoading();
			}
		});
	},
	// 获取每日推荐分类
	getBuyCatsList() {
		getApp().request({
			url: getApp().api.default.buy_cats_list,
			data: {
				showSite: 2
			},
			success: (res) => {
				if (res.code == 0) {
					console.log(res);
					var catsList = res.data
					this.setData({
						newActsList: catsList
					})
					console.log(this.data.newActsList);
					for (let i in catsList) {
						this.getBuyActsList(catsList[i].id, i, catsList[i].name)
					}
				}
			},
			complete: (res) => {
				getApp().core.hideLoading();
			}
		});
	},
	getBuyActsList(id, i) {
		var newActsList = this.data.newActsList
		getApp().request({
			url: getApp().api.default.buy_acts_list,
			data: {
				circleType: id
			},
			success: (res) => {
				if (res.code == 0) {
					newActsList[i].list = res.data.list

					this.setData({
						newActsList: newActsList
					})
					console.log(this.data.newActsList);
					// console.log(res);
				}
			},
		})
	},
	// 上拉分页
	getMore() {
		var self = this

		var page = self.data.page
		var index = page
		var data = {
			cat_ids: cat_id,
			is_home: cat_id == 0 ? 1 : ''
		}
		if (cat_id == 0) {
			var url = getApp().api.default.walk_active_list
			getApp().core.pading(self, url, data, function(res, index) {
				if (res.data.data.length == 0) {
					self.setData({
						stopLoadMore: true,
						is_no_more: true
					})
					return
				}
				var newActList = res.data.data
				var nowActList = self.data.actList.concat(newActList)
				self.setData({
					actList: nowActList,
					loadingSwitch: true
				})
			})
		} else {
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
					loadingSwitch: true
				})
			})
		}
	},
	/**
	 * 购买记录
	 */


	/**
	 * 加载页面数据
	 */
	// loadData: function(options) {
	// 	var self = this;
	// 	var pages_index_index = getApp().core.getStorageSync(getApp().const.PAGE_INDEX_INDEX);
	// 	if (pages_index_index) {
	// 		pages_index_index.act_modal_list = [];
	// 		self.setData(pages_index_index);
	// 	}
	// 	getApp().request({
	// 		url: getApp().api.default.index,
	// 		success: function(res) {
	// 			if (res.code == 0) {
	// 				if (!page_first_init) {
	// 					res.data.act_modal_list = [];
	// 				} else {
	// 					if (!self.data.user_info_show) {
	// 						page_first_init = false;
	// 					}
	// 				}

	// 				self.setData({
	// 					module_list: res.data
	// 				});
	// 				getApp().core.setStorageSync(getApp().const.PAGE_INDEX_INDEX, res.data);
	// 				self.miaoshaTimer();
	// 			}
	// 		},
	// 		complete: function() {
	// 			getApp().core.stopPullDownRefresh();
	// 		}
	// 	});

	// },
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		var self = this;
		getApp().page.onShow(this);
		gSpecificationsModel.init(this);
		this.getBrandLike()
		// var query = wx.createSelectorQuery();
		//     //选择id
		//     query.select('.big-nav').boundingClientRect(function (rect) {
		//     self.setData({
		//        navHeight: rect.height
		//     })
		// }).exec();
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {
		var self = this
		var id = this.data.id
		cat_id = cat_id
		// this.getGYG()
		if (cat_id == 0) {
			self.getActivityFilter()
			this.getBrandLike()
		} else {
			self.getWalkGoodsList()
		}
		this.setData({
			page: 1,
			is_no_more: false
		})

		// this.loadData();
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function(options) {
		return getApp().page.onShareQp(this);
	},

	showshop: function(e) {

		var self = this;
		var goods_id = e.currentTarget.dataset.id;
		var data = e.currentTarget.dataset;
		getApp().request({
			url: getApp().api.default.goods,
			data: {
				id: goods_id
			},
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						data: data,
						attr_group_list: res.data.attr_group_list,
						goods: res.data,
						showModal: true
					});
				}
			}
		});
	},
	
	changeNav: function(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		cat_id = e.currentTarget.dataset.id
		self.setData({
			navIns: index,
			loadingSwitch: true,
			stopLoadMore: false,
			cat_id: cat_id,
			page: 1,
			is_no_more: false
		})
		wx.pageScrollTo({
			scrollTop: 0
		})
		if (cat_id == 0) {
			self.getActivityFilter()
		} else {
			self.getWalkGoodsList()
			self.getActivityFilter()
		}
	},
	receive: function(e) {
		var self = this;
		var id = e.currentTarget.dataset.index;
		getApp().core.showLoading({
			title: '领取中',
			mask: true,
		});
		if (!self.hideGetCoupon) {
			self.hideGetCoupon = function(e) {
				var url = e.currentTarget.dataset.url || false;
				self.setData({
					get_coupon_list: null,
				});
				wx.navigateTo({
					url: url || '/pages/list/list',
				});
			};
		}
		getApp().request({
			url: getApp().api.coupon.receive,
			data: {
				id: id
			},
			success: function(res) {
				getApp().core.hideLoading();
				if (res.code == 0) {
					self.setData({
						get_coupon_list: res.data.list,
						coupon_list: res.data.coupon_list
					});
				} else {
					getApp().core.showToast({
						title: res.msg,
						duration: 2000
					})
					self.setData({
						coupon_list: res.data.coupon_list
					});
				}
			},
			// complete: function () {
			//   getApp().core.hideLoading();
			// }
		});
	},

	closeCouponBox: function(e) {
		this.setData({
			get_coupon_list: ""
		});
	},
	miaoshaTimer: function() {
		var self = this;
		if (!self.data.miaosha) {
			return;
		}
		if (self.data.miaosha.rest_time == 0) {
			return;
		}
		if (self.data.miaosha.ms_next) {} else {
			timer = setInterval(function() {
				if (self.data.miaosha.rest_time > 0) {
					self.data.miaosha.rest_time = self.data.miaosha.rest_time - 1;
				} else {
					clearInterval(timer);
					return;
				}
				self.data.miaosha.times = self.setTimeList(self.data.miaosha.rest_time);
				self.setData({
					miaosha: self.data.miaosha,
				});
			}, 1000);
		}
	},

	onHide: function() {
		getApp().page.onHide(this);
		this.setData({
			play: -1
		});
		clearInterval(interval);
	},
	onUnload: function() {
		getApp().page.onUnload(this);
		this.setData({
			play: -1
		});
		clearInterval(timer);
		clearInterval(interval);
	},
	to_dial: function() {
		var contact_tel = this.data.store.contact_tel;
		getApp().core.makePhoneCall({
			phoneNumber: contact_tel
		})
	},

	closeActModal: function() {
		var self = this;
		var act_modal_list = self.data.act_modal_list;
		var show_next = true;
		var next_i;
		for (var i in act_modal_list) {
			var index = parseInt(i);
			if (act_modal_list[index].show) {
				act_modal_list[index].show = false;
				next_i = index + 1;
				if (typeof act_modal_list[next_i] != 'undefined' && show_next) {
					show_next = false;
					setTimeout(function() {
						self.data.act_modal_list[next_i].show = true;
						self.setData({
							act_modal_list: self.data.act_modal_list
						});
					}, 500);
				}
			}
		}
		self.setData({
			act_modal_list: act_modal_list,
		});
	},
	naveClick: function(e) {
		var self = this;
		getApp().navigatorClick(e, self);
	},
	play: function(e) {
		this.setData({
			play: e.currentTarget.dataset.index
		});
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
	onReachBottom() {
		this.getMore()
	},
	fullscreenchange: function(e) {
		if (e.detail.fullScreen) {
			fullScreen = true;
		} else {
			fullScreen = false;
		}
	},
	toNav: function() {
		wx.navigateTo({
			url: '../special/special'
		})
	}
});
