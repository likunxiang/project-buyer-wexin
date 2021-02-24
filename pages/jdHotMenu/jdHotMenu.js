// pages/jdHotMenu/jdHotMenu.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom,
		moren: '全部品类',
		priceDefault: true,
		priceUp: true,
		showChangeMore: false,
		pageType: 'normal',
		page: 1,
		goodList: [],

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.getCats()
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
					var arr = res.data
					for (let i in arr) {
						arr[i].checked = false
					}
					console.log(arr);
					self.setData({
						catsArr: arr
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
	showChange1: function() {
		this.getCats()
		this.setData({
			showChangeMore: !this.data.showChangeMore
		})
	}, //多选关闭
	closeChange: function() {
		this.setData({
			showChangeMore: false
		})
	},
	// 价格排序
	priceSort: function() {
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
	changeMoreNav: function(e) {
		console.log(e);
		var id = e.currentTarget.dataset.id
		var name = e.currentTarget.dataset.name
		var index = e.currentTarget.dataset.index
		let newCatArr = this.data.catsArr;
		console.log(newCatArr);
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
			catsArr: newCatArr,
			page: 1,
			stopLoadMore: false,
			is_no_more: false,
		})
		console.log(this.data.cat_id);
		console.log(this.data.moren);
		getApp().core.showLoading({
			title: '加载中'
		})
		this.getWalkGoodsList()
	},
	inputHotGoods(e) {
		this.setData({
			goodsValue: e.detail.value
		})
	},
	recond() {
		var keyword = this.data.goodsValue
		if (!keyword) {
			return
		}
		getApp().request({
			url: getApp().api.default.recond_goods_want,
			method: 'POST',
			data: {
				keyword: this.data.goodsValue
			},
			success: (res) => {
				if (res.code == 0) {
					wx.showModal({
						title: '添加成功',
						showCancel: false,
						success: (res) => {
							if (res.confirm) {
								this.setData({
									goodsValue: ''
								})
							}
						}
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
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
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
