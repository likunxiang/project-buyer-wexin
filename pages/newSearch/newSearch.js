// pages/newSearch/newSearch.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		y: getApp().core.getSystemInfoSync().windowHeight,
		tabIns: 0,
		tabList: ['商品', '活动专场'],
		morenBrank: '全部品牌',
		morenCategory: '全部小类',
		morenSmallCat: '全部品类',
		priceDefault: true,
		priceUp: true,
		showSeach: true,
		seachHeight: '',
		chooseOpen: false,
		categoryOpen: false,
		page: 1,
		seachVal: ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		getApp().page.onLoad(this, options);
		this.loadData();
		if(options.val) {
			this.setData({
				seachVal: options.val
			}, () => {
				this.sendSeach();
			})
		}
	},
	loadData: function() {
		var self = this;
		if (getApp().core.getStorageSync("History_seach")) {
			self.setData({
				showHistor: true,
				historyList: JSON.parse(getApp().core.getStorageSync("History_seach"))
			})
		}
		// 获取热搜
		getApp().request({
			url: getApp().api.default.hot_search,
			success: function(res) {
				if (res.code == 0 && res.data.length != 0) {
					self.setData({
						showHotsearch: true,
						hotSearchList: res.data
					})
				}
			},
			complete: (res) => {
				getApp().core.hideLoading();
			}
		});
	},
	changeTab: function(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		self.setData({
			tabIns: index,
			priceDefault: true,
			priceUp: true,
		})
		if (index == 0) {
			getApp().request({
				url: getApp().api.default.search_goods,
				data: {
					q: this.data.seachVal,
					brand_id: this.data.brand || '',
					p_cat_id: this.data.p_cat_id || '',
					cat_id: this.data.cat_id || '',
				},
				success: function(res) {
					if (res.code == 0) {
						self.setData({
							goodsList: res.data.goods,
							brands: res.data.brands,
							catsList: res.data.cats,
							page: 1
						})
					} else {
						if (res.msg) {
							wx.showToast({
								title: res.msg,
								icon: 'none',
								duration: 2000
							})
						}
					}
				},
				complete: function() {
					getApp().core.hideLoading();
					getApp().core.stopPullDownRefresh();
				}
			});
		} else {
			self.getSearchAct()
		}
	},
	getSearchAct: function() {
		var self = this
		getApp().request({
			url: getApp().api.default.search_act,
			data: {
				q: self.data.seachVal
			},
			success(res) {
				if (res.code == 0) {
					self.setData({
						["list[0]"]: res.data.acts,
						page: 1
					})
				}
				if (res.code == 1) {
					if (res.msg) {
						wx.showToast({
							title: res.msg,
							icon: 'none',
							duration: 2000
						})
					}
				}
			},
			complete: function() {
				getApp().core.hideLoading();
				getApp().core.stopPullDownRefresh();
			}
		})
	},
	// 品牌选择
	openChoose: function() {
		this.setData({
			chooseOpen: !this.data.chooseOpen,
			categoryOpen: false,
			smallCatOpen: false,
		})
	},
	closeChoose: function() {
		this.setData({
			chooseOpen: !this.data.chooseOpen
		})
	},
	chooseAll: function() {
		var self = this
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.default.search_goods,
			data: {
				q: this.data.seachVal,
				brand_id: '',
				p_cat_id: this.data.p_cat_id || '',
				cat_id: this.data.cat_id || '',
			},
			success(res) {
				if (res.code == 0) {
					self.setData({
						goodsList: res.data.goods,
						// smallCatList: res.data.p_cats,
						// catsList: res.data.cats,
						priceDefault: true,
						priceUp: true,
						sort: '',
						by: ''
					})
					// if(!self.data.p_cat_id) {
					// 	self.setData({
					// 		smallCatList: res.data.p_cats,
					// 	})
					// }
				}
			},
			complete(res) {
				getApp().core.hideLoading()
			}

		})
		self.setData({
			chooseIns: 0,
			morenBrank: '全部品牌'
		})
		self.closeChoose()
	},
	chooseBrands: function(e) {
		var self = this
		var id = e.currentTarget.dataset.index
		var text = e.currentTarget.dataset.text
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.default.search_goods,
			data: {
				q: this.data.seachVal,
				brand_id: id,
				cat_id: this.data.cat_id || '',
				p_cat_id: this.data.p_cat_id || '',
			},
			success(res) {
				if (res.code == 0) {
					self.setData({
						goodsList: res.data.goods,
						// smallCatList: res.data.p_cats,
						// catsList: res.data.cats,
						brand_id: id,
						priceDefault: true,
						priceUp: true,
						sort: '',
						by: ''
					})
					if (!self.data.cat_id) {
						self.setData({
							catsList: res.data.cats,
						})

					}
					if (!self.data.p_cat_id) {
						self.setData({
							smallCatList: res.data.p_cats,
						})
					}
				}
			},
			complete(res) {
				getApp().core.hideLoading()
			}
		})
		self.setData({
			chooseIns: id,
			morenBrank: text
		})
		self.closeChoose()
	},
	// 小类选择
	openCategory: function() {
		this.setData({
			categoryOpen: !this.data.categoryOpen,
			chooseOpen: false,
			smallCatOpen: false,
		})
	},
	closeCategory: function() {
		this.setData({
			categoryOpen: !this.data.categoryOpen
		})
	},
	categoryAll: function() {
		var self = this
		self.setData({
			categoryIns: 0,
			morenCategory: '全部小类',
			chooseIns: 0,
			morenBrank: '全部品牌'
		})
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.default.search_goods,
			data: {
				q: this.data.seachVal,
				cat_id: '',
				p_cat_id: this.data.p_cat_id || '',
				// brand_id: this.data.brand_id || '',
			},
			success(res) {
				if (res.code == 0) {
					self.setData({
						goodsList: res.data.goods,
						brands: res.data.brands,
						priceDefault: true,
						priceUp: true,
						chooseIns: 0,
						sort: '',
						by: ''
					})
				}
			},
			complete(res) {
				getApp().core.hideLoading()
			}
		})
		self.closeCategory()
	},
	chooseCategory: function(e) {
		var self = this
		var id = e.currentTarget.dataset.index
		var text = e.currentTarget.dataset.text

		self.setData({
			categoryIns: id,
			morenCategory: text,
			chooseIns: 0,
			morenBrank: '全部品牌',
		})
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.default.search_goods,
			data: {
				q: this.data.seachVal,
				cat_id: id,
				// brand_id: this.data.brand_id || '',
				p_cat_id: this.data.p_cat_id || '',
			},
			success(res) {
				if (res.code == 0) {
					self.setData({
						goodsList: res.data.goods,
						// smallCatList: res.data.p_cats,
						brands: res.data.brands,
						cat_id: id,
						priceDefault: true,
						priceUp: true,
						sort: '',
						chooseIns: 0,
						by: ''
					})
					// if (!self.data.brands) {
					// 	self.setData({
					// 		brands: res.data.brands,
					// 	})
					// }
				}
			},
			complete(res) {
				getApp().core.hideLoading()
			}
		})
		self.closeCategory()
	},
	// 品类选择
	openSmallCat: function() {
		this.setData({
			smallCatOpen: !this.data.smallCatOpen,
			categoryOpen: false,
			chooseOpen: false,

		})
	},
	closeSmallCat: function() {
		this.setData({
			smallCatOpen: !this.data.smallCatOpen
		})
	},
	smallCatAll: function() {
		var self = this
		self.setData({
			smallCatIns: 0,
			chooseIns: 0,
			categoryIns: 0,
			morenSmallCat: '全部品类',
			morenBrank: '全部品牌',
			morenCategory: '全部小类'
		})
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.default.search_goods,
			data: {
				q: self.data.seachVal,
				p_cat_id: '',
				// brand_id: self.data.brand_id || '',
				// cat_id: self.data.cat_id || '',
			},
			success(res) {
				if (res.code == 0) {
					self.setData({
						goodsList: res.data.goods,
						brands: res.data.brands,
						catsList: res.data.cats,
						priceDefault: true,
						priceUp: true,
						sort: '',
						by: ''
					})
				}

			},
			complete(res) {
				getApp().core.hideLoading()
			}
		})
		self.closeSmallCat()
	},
	chooseSmallCat: function(e) {
		var self = this
		var id = e.currentTarget.dataset.index
		var text = e.currentTarget.dataset.text

		self.setData({
			smallCatIns: id,
			morenSmallCat: text,
			chooseIns: 0,
			categoryIns: 0,
			morenBrank: '全部品牌',
			morenCategory: '全部小类'
		})
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.default.search_goods,
			data: {
				q: this.data.seachVal,
				p_cat_id: id,
				// brand_id: this.data.brand_id || '',
				// cat_id: this.data.cat_id || '',
			},
			success(res) {
				if (res.code == 0) {
					self.setData({
						goodsList: res.data.goods,
						brands: res.data.brands,
						catsList: res.data.cats,
						p_cat_id: id,
						priceDefault: true,
						priceUp: true,
						sort: '',
						by: ''
					})
					// if (!self.data.brand_id) {
					// 	self.setData({
					// 		brands: res.data.brands
					// 	})
					// }
					// if (!self.data.cat_id) {
					// 	self.setData({
					// 		catsList: res.data.cats,
					// 	})
					// }
				}
			},
			complete(res) {
				getApp().core.hideLoading()
			}
		})
		self.closeSmallCat()
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
				url: getApp().api.default.search_goods,
				data: {
					q: this.data.seachVal,
					brand_id: self.data.brand_id || '',
					cat_id: self.data.cat_id || '',
					p_cat_id: self.data.p_cat_id || '',
					sort: 'price',
					by: 'asc'
				},
				success(res) {
					if (res.code == 0) {
						self.setData({
							goodsList: res.data.goods,
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
				url: getApp().api.default.search_goods,
				data: {
					q: this.data.seachVal,
					brand_id: self.data.brand_id || '',
					cat_id: self.data.cat_id || '',
					sort: 'price',
					by: 'desc'
				},
				success(res) {
					if (res.code == 0) {
						self.setData({
							goodsList: res.data.goods,
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
	// 清空输入框
	clearVal: function() {
		var self = this;
		if (self.data.timeout) {
			clearTimeout(self.data.timeout);
		}
		this.setData({
			seachVal: '',
			showSeach: true,
			processSeach: false,
			showRult: false,
			rultContent: false,
			showHistor: false, //历史记录
			historyList: [],
			showHotsearch: false, //热搜
			hotSearchList: [],
			morenBrank: '全部品牌',
			morenCategory: '全部小类',
			morenSmallCat: '全部品类',
			brand_id: '',
			cat_id: '',
			p_cat_id: '',
			priceDefault: true,
			priceUp: true,
			chooseOpen: false,
			categoryOpen: false,
			smallCatOpen: false,
			page: 1,
			categoryIns: 0,
			chooseIns: 0,
			smallCatIns: 0,
			tabIns: 0,
			list: []
		}, () => {
			self.loadData();
			
		})
	},
	// 点击历史搜索
	history: function(e) {
		var val = e.currentTarget.dataset.words,
			self = this;
		this.setData({
			seachVal: val
		}, () => {
			self.sendSeach();
		})
	},
	// 输入框改变
	seachInput: function(e) {
		var val = e.detail.value,
			self = this;
		self.setData({
			seachVal: val
		})
		// 防抖函数
		if (self.data.timeout) {
			clearTimeout(self.data.timeout);
		}
		self.data.timeout = setTimeout(function() {
			// 模糊搜索
			getApp().request({
				url: getApp().api.default.like_search,
				data: {
					q: val
				},
				success: function(res) {
					if (res.code == 0) {
						var processSeach = true;
						if (res.data.length == 0) {
							processSeach = false
						}
						self.setData({
							processSeach: processSeach,
							likeList: res.data,
						})
					}
				}
			});
		}, 500)
	},
	// 清除历史记录
	removeHistory: function() {
		wx.removeStorageSync('History_seach');
		this.setData({
			showHistor: false,
			historyList: []
		})
	},
	closeLike () {
		this.setData({
			processSeach: false
		})
	},
	stop () {
		return
	},
	// 执行搜索
	sendSeach: function() {
		var self = this;
		var token = getApp().core.getStorageSync('ACCESS_TOKEN')
		if (!token) {
			this.setData({
				showGetLogin: true,
				user_info_show: true,
			})
			return
		}
		var val = self.data.seachVal
		if (val.length > 0) {
			if (getApp().core.getStorageSync("History_seach")) {
				var searchList = JSON.parse(getApp().core.getStorageSync("History_seach"));
				if (searchList.indexOf(val) == -1) {
					searchList.unshift(val);

					getApp().core.setStorageSync("History_seach", JSON.stringify(searchList))
				}
			} else {
				var searchList = [val];
				getApp().core.setStorageSync("History_seach", JSON.stringify(searchList))
			}
		} else {
			wx.showModal({
				title: '请输入关键字',
				showCancel: false,
				success: (res) => {
					self.clearVal();
				}
			})
			return false;
		}
		getApp().core.showLoading({
			title: '加载中',
		});
		// 商品搜索
		getApp().request({
			url: getApp().api.default.search_goods,
			data: {
				q: this.data.seachVal
			},
			success: function(res) {
				if (res.code == 0) {
					var datas = res.data;
					var catsList = [],
						goodsList = [],
						smallCatList = [],
						brands = [];
					if (datas.brands) {
						brands = datas.brands
					}
					if (datas.cats) {
						catsList = datas.cats
					}
					if (datas.goods) {
						goodsList = datas.goods
					}
					if (datas.p_cats) {
						smallCatList = datas.p_cats
					}
					self.setData({
						showSeach: false,
						processSeach: false,
						showRult: true,
						rultContent: true,
						goodsList: goodsList,
						brands: brands,
						catsList: catsList,
						smallCatList: smallCatList,
						is_request: true,
						page: 1
					})
				} else {
					if (res.msg) {
						wx.showToast({
							title: res.msg,
							icon: 'none',
							duration: 2000
						})
					}
				}
			},
			complete: function() {
				getApp().core.hideLoading();
			}
		});
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
		var self = this
		self.setData({
			stopLoadMore: false,
			page: 1
		})
		if (self.data.tabIns == 0) {
			getApp().request({
				url: getApp().api.default.search_goods,
				data: {
					q: this.data.seachVal
				},
				success: function(res) {
					if (res.code == 0) {
						self.setData({
							goodsList: res.data.goods,
							brands: res.data.brands,
							catsList: res.data.cats,
							page: 1
						})
					} else {
						if (res.msg) {
							wx.showToast({
								title: res.msg,
								icon: 'none',
								duration: 2000
							})
						}
					}
				},
				complete: function() {
					getApp().core.hideLoading();
					getApp().core.stopPullDownRefresh();
				}
			});
		} else {
			self.getSearchAct()
		}
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {
		var self = this
		var page = self.data.page
		if (self.data.tabIns == 0) {
			var url = getApp().api.default.search_goods
			var data = {
				q: self.data.seachVal,
				brand_id: self.data.brand_id || '',
				cat_id: self.data.cat_id || '',
				p_cat_id: self.data.p_cat_id || '',
				sort: self.data.sort || '',
				by: self.data.by || ''
			}
			getApp().core.pading(self, url, data, function(res) {
				if (res.data.goods.length == 0) {
					self.setData({
						stopLoadMore: true,
					})
					return
				}
				var newGoodList = res.data.goods
				var nowGoodList = self.data.goodsList.concat(newGoodList)
				self.setData({
					goodsList: nowGoodList,
				})
			})
		}
		if (self.data.tabIns == 1) {
			var url = getApp().api.default.search_act
			var index = page
			var data = {
				q: self.data.seachVal,
			}
			getApp().core.pading(self, url, data, function(res) {
				if (res.data.goods.length == 0) {
					self.setData({
						stopLoadMore: true,
					})
					return
				}
				self.setData({
					["list[" + index + "]"]: res.data.list,
				})
			})
		}
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})
