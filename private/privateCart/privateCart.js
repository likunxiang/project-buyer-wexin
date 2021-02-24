// pages//private/privateCart/privateCart.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		is_all: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {

	},
	getCartList() {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_cart,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success(res) {
				if (res.code == 0) {
					self.setData({
						cartList: res.data
					})
					self.totalPrice()
					self.isAll()
				}
			},
			complete: (res) => {
				getApp().core.hideLoading()
				getApp().core.stopPullDownRefresh()
			}
		})

	},
	changeCartNum(e) {
		var self = this
		var cartsNum = e.detail.value
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var price = e.currentTarget.dataset.price
		var goodsNum = self.data.cartList[index].goods_num
		if (parseInt(cartsNum) < 0) {
			wx.showToast({
				title: '商品数量不得小于0',
				icon: 'none'
			})
			return false
		}
		if (parseInt(cartsNum) > parseInt(goodsNum)) {
			wx.showToast({
				title: '库存不足',
				icon: 'none'
			})
			self.setData({
				['cartList[' + index + '].cart_num']: goodsNum
			})
		} else {
			self.setData({
				['cartList[' + index + '].cart_num']: cartsNum
			})
		}
		self.totalPrice()
		self.editCartNum(id, self.data.cartsNum, price)
	},
	isAll() {
		var self = this
		var cartList = self.data.cartList

		var sel_count = 0
		for (var i in cartList) {
			if (cartList[i].is_sel == 1) {
				sel_count++
			}
		}
		if (sel_count == cartList.length) {
			self.setData({
				is_all: true
			})
		} else {
			self.setData({
				is_all: false
			})
		}
	},
	chooseAll() {
		var self = this
		var cartList = self.data.cartList
		var is_all = self.data.is_all
		var idArr = ''
		var is_sel
		if (is_all) {
			is_sel = 2
			for (var i in cartList) {
				cartList[i].is_sel = 2
				if (i<cartList.length-1) {
					idArr += cartList[i].cart_id + ','
				} else {
					idArr += cartList[i].cart_id
				}
			}
		} else {
			is_sel = 1
			for (var i in cartList) {
				cartList[i].is_sel = 1
				if (i<cartList.length-1) {
					idArr += cartList[i].cart_id + ','
				} else {
					idArr += cartList[i].cart_id
				}
			}
		}
		self.setData({
			cartList: cartList,
			is_all: !is_all
		})
		getApp().request({
			url: getApp().api.selfSupport.edit_cart_is_sel,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				id: idArr,
				is_sel: is_sel
			},
			success(res) {
				if (res.code == 0) {
		
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			}
		})
		self.totalPrice()
	},
	chooseCart(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var is_sel = self.data.cartList[index].is_sel
		if (is_sel == 1) {
			is_sel = 2
		} else {
			is_sel = 1
		}
		self.setData({
			['cartList[' + index + '].is_sel']: is_sel
		})
		self.isAll()
		self.totalPrice()
		getApp().request({
			url: getApp().api.selfSupport.edit_cart_is_sel,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				id: id,
				is_sel: is_sel
			},
			success(res) {
				if (res.code == 0) {

				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			}
		})
	},
	// 加
	addNum(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var price = e.currentTarget.dataset.price
		var cartsNum = self.data.cartList[index].cart_num
		cartsNum = +cartsNum + 1
		self.setData({
			['cartList[' + index + '].cart_num']: cartsNum
		})
		self.totalPrice()
		self.editCartNum(id, cartsNum, price)
	},
	reduceNum(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var price = e.currentTarget.dataset.price
		var cartsNum = self.data.cartList[index].cart_num
		cartsNum = +cartsNum - 1
		self.setData({
			['cartList[' + index + '].cart_num']: cartsNum
		})
		self.totalPrice()
		self.editCartNum(id, cartsNum, price)
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

				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			}
		})
	},
	totalPrice() {
		var self = this
		var cartList = self.data.cartList
		var total_price = 0
		for (var i in cartList) {
			if (cartList[i].is_sel == 1) {
				total_price += cartList[i].cart_num * cartList[i].goods_price
			}
		}
		self.setData({
			total_price: total_price
		})
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},
	//
	toBasket () {
		wx.navigateTo({
			url: '/private/privateBasket/privateBasket?type=1'
		})
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		this.getCartList()
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
		this.getCartList()
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
