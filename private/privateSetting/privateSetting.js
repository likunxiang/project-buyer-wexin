// pages//private/privateSetting/privateSetting.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		expandList: [{
				id: 2,
				name: '配送',
				check: false
			},
			{
				id: 1,
				name: '自提',
				check: false
			}
		],
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.getAdAndSetting()
	},
	getAdAndSetting () {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_my_shop,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success(res) {
				if (res.code == 0) {
					var expressSet = res.data.expressSet
					var expandList = self.data.expandList
					var wayText
					for (var i in expressSet) {
						if(expressSet[i].indexOf('2')>-1) {
							expandList[0].check = true
						}
						if(expressSet[i].indexOf('1')>-1) {
							expandList[1].check = true
						}
					}
					self.setData({
						expandList: expandList
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
	toPickUp (e) {
		var index = e.currentTarget.dataset.index
		if (index == 1) {
			wx.navigateTo({
				url: '/private/privatePickUpSetting/privatePickUpSetting'
			})
		} else {
			return
		}
	},
	toSubmit () {
		wx.navigateTo({
			url: "/private/submitMaterial/submitMaterial"
		})
	},
	changeTyep(e) {
		var check = e.currentTarget.dataset.check
		var index = e.currentTarget.dataset.index
		var expandId = this.data.expandId
		if (!check) {
			this.setData({
				['expandList['+ index +'].check']: !check,
			})
		} else {
			this.setData({
				['expandList['+ index +'].check']: !check
			})
		}
		
	},
	getAddressList() {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_address_list,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success(res) {
				if (res.code == 0) {
					self.setData({
						addressList: res.data.list
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
	sureBtn () {
		var self = this
		var expandList = self.data.expandList
		var expandId = []
		var addressList = self.data.addressList
		for (var i in expandList) {
			if (expandList[i].check) {
			
				expandId.push(expandList[i].id)
			}
		}
		if (expandId.indexOf(1) > -1){
			for (var j in addressList) {
				if (addressList[j].is_sel == '1') {
					var	allowUp = true
				}
			}
			if(!allowUp) {
				wx.showModal({
					title: '请设置提货地址',
					showCancel: false,
					
					success: (res) => {
						if(res.confirm) {
							wx.navigateTo({
								url: '/private/privatePickUpSetting/privatePickUpSetting'
							})
						}
					}
				})
				return
			}
		}
		
		getApp().core.showLoading({
		    title: "正在提交",
		    mask: true,
		});
		getApp().request({
			url: getApp().api.selfSupport.express_set,
			method:'POST',
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				express_set: expandId
			},
			success(res) {
				if(res.code == 0) {
					wx.showModal({
						title: res.msg,
						showCancel: false,
						success: (res) => {
							if (res.confirm) {
								wx.navigateBack()
							}
						}
					})
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			},
			complete () {
				getApp().core.hideLoading();
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
		this.getAddressList()
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
