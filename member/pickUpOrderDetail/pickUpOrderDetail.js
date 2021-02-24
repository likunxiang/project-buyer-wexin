// pages/pickUpOrderDetail/pickUpOrderDetail.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		orderNo: ['编号-3', '编号-10', '编号-12'],
		orderIns: 0,
		remarkValue: ''
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		if (options.scene) {
			var scene = decodeURIComponent(options.scene);
			var scene_obj = getApp().helper.scene_decode(scene);
			if (scene_obj.id) {
				this.setData({
					id: scene_obj.id,
					orderIns: scene_obj.id
				})
			}
		} else {
			this.setData({
				id: options.id,
				orderIns: options.id
			})
		}
		
		this.getPickOrderDetail()
		
	},
	getPickOrderDetail () {
		getApp().request({
			url: getApp().api.group.pick_order_detail,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				id: this.data.id
			},
			success: (res) => {
				if (res.code == 0) {
					var goodsList = res.data.detail
					for (var i in goodsList) {
						goodsList[i].checked = false
					}
					var index = 'date' + this.data.orderIns
					this.setData({
						orderNo: res.data.more_order_id,
						pickDetail: res.data,
						toview: index,
						goodsList: goodsList
					})
				}
			}
		})
	},
	chooseGoods (e) {
		var index = e.currentTarget.dataset.index
		var goodsList = this.data.goodsList
		var checked = goodsList[index].checked
		this.setData({
			['goodsList['+ index +'].checked']: !checked
		})
	},
	changeOrder (e) {
		var text = e.currentTarget.dataset.text
		this.setData({
			orderIns: text,
			id: text
		})
		this.getPickOrderDetail()
	},
	call () {
		var text = this.data.pickDetail.mobile
		wx.makePhoneCall({
		  phoneNumber: text,
		  success (res) {
			  
		  },
		  fail (res) {
			  return
		  }
		})
	},
	remarkInput (e) {
		this.setData({
			remarkValue: e.detail.value
		})
	},
	pickUpGoods () {
		var goodsList = this.data.goodsList
		var idArr = ''
		for (var i in goodsList) {
			if (goodsList[i].checked) {
				idArr = idArr + goodsList[i].id + ','
			}
		}
		if (idArr.length == 0) {
			wx.showToast({
				title: '请选择提货商品',
				icon: 'none'
			})
			return
		}
		getApp().request({
			url: getApp().api.group.pick_order_confirm,
			data: {
				order_id: this.data.id,
				od_ids: idArr,
				remark: this.data.remarkValue
			},
			success: (res) => {
				if (res.code == 0) {
					wx.showModal({
						title: '提货成功',
						showCancel: false,
						success: (res) => {
							if(res.confirm) {
								this.getPickOrderDetail()
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

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},

})
