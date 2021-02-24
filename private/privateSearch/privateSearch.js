// pages/newSearch/newSearch.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		y: getApp().core.getSystemInfoSync().windowHeight,
		tabIns: 0,
		showSeach: true,
		seachHeight: '',
		page: 1,
		seachVal: ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.loadData();
	},
	loadData: function() {
		var self = this;
		if (getApp().core.getStorageSync("History_seach_private")) {
			self.setData({
				showHistor: true,
				historyList: JSON.parse(getApp().core.getStorageSync("History_seach_private"))
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
			page: 1,
			list: []
		}, () => {
			self.loadData();
			getApp().core.hideLoading();
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
	},
	// 清除历史记录
	removeHistory: function() {
		wx.removeStorageSync('History_seach_private');
		this.setData({
			showHistor: false,
			historyList: []
		})
	},
	// 输入框失焦
	seachBlur: function(e) {
		var self = this
		setTimeout(() => {
			self.setData({
				processSeach: false
			})
		}, 200)
	},
	// 执行搜索
	sendSeach: function(data) {
		var self = this;
		var val = this.data.seachVal
		if (val.length > 0) {
			if (getApp().core.getStorageSync("History_seach_private")) {
				var searchList = JSON.parse(getApp().core.getStorageSync("History_seach_private"));
				if (searchList.indexOf(val) == -1) {
					searchList.unshift(val);

					getApp().core.setStorageSync("History_seach_private", JSON.stringify(searchList))
				}
			} else {
				var searchList = [val];
				getApp().core.setStorageSync("History_seach_private", JSON.stringify(searchList))
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
			url: getApp().api.selfSupport.get_goods_list_user,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				name: this.data.seachVal,
				cart_sum_show: true
			},
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						goodsList: res.data.list,
						showSeach: false,
						processSeach: false,
						showRult: true,
						rultContent: true,
						is_request: true,
						page: 1
					})
					self.getCartNum()
					self.getAdAndSetting()
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
	// 加
	addNum(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var price = e.currentTarget.dataset.price
		var goodsNum = self.data.goodsList[index].cart_num
		goodsNum = +goodsNum + 1
		self.setData({
			['goodsList[' + index + '].cart_num']: goodsNum
		})
		self.editCartNum(id, goodsNum, price)
	},
	reduceNum(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var price = e.currentTarget.dataset.price
		var goodsNum = self.data.goodsList[index].cart_num
		goodsNum = +goodsNum - 1
		self.setData({
			['goodsList[' + index + '].cart_num']: goodsNum
		})
		self.editCartNum(id, goodsNum, price)
	},
	editCartNum(id, num, price) {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.edit_cart,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				num: num,
				goods_id: id,
				price: price
			},
			success(res) {
				if (res.code == 0) {
					self.getCartNum()
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			}
		})
	},
	getCartNum() {
		getApp().request({
			url: getApp().api.selfSupport.get_cart_num,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						cartNum: res.data
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
	copyText() {
		var text = this.data.wx_mobile
		wx.setClipboardData({
			data: text,
			success(res) {
				wx.showToast({
					title: '手机已复制，快去联系吧',
					duration: 3000,
					icon: 'none'
				})
				wx.getClipboardData({
					success(res) {
	
					}
				})
			}
		})
	},
	getAdAndSetting() {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_my_shop,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success(res) {
				if (res.code == 0) {
					self.setData({
						nowStatus: res.data.nowStatus
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
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {
		var self = this
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})
