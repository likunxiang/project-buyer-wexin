// pages/groupPickUp/groupPickUp.js
const chooseLocation = requirePlugin('chooseLocation');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		if (this.data.latitude && this.data.longitude) {
			this.getPickUp()
		} else {
			wx.getLocation({
				type: 'gcj02', //返回可以用于wx.openLocation的经纬度
				success: (res) => {
					const latitude = res.latitude
					const longitude = res.longitude
					this.setData({
						latitude: latitude,
						longitude: longitude
					})
					getApp().request({
						// url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + ',' + longitude +
						// '&key=3F5BZ-FWYWU-JUNV5-46DYM-BTCEH-ZDFGG',  // 亲铺
						// url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + ',' + longitude +
						//	'&key=MPHBZ-PIYCX-KQK4Q-72OJM-NWUL6-CUB2J',  // 洪荒大陆
						url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + ',' + longitude +
							'&key=UOEBZ-GLVKK-RMKJH-AXPVO-BG3TF-IVFFE', // 内购家
						success: (res) => {
							this.setData({
								address: res.result.address
							})
						}
					})
					this.getPickUp()
				},
				fail: (res) => {
					wx.getSetting({
						success: function(res) {
							if (!res.authSetting['scope.userLocation']) {
								wx.showModal({
									title: '',
									content: '请允许小程序获取您的定位',
									confirmText: '授权',
									success: function(res) {
										if (res.confirm) {

											wx.openSetting();
										} else {
										}
									}
								})
							} else {
								//用户已授权，但是获取地理位置失败，提示用户去系统设置中打开定位
								wx.showModal({
									title: '',
									content: '请在系统设置中打开定位服务',
									confirmText: '确定',
									success: function(res) {}
								})
							}
						}
					})
				}
			})
		}
		this.getBackground()
	},
	getBackground() {
		getApp().request({
			url: getApp().api.group.get_pick_backgroud,
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						pickBackground: res.data.banner
					})
				}
			}
		})
	},
	editPickUp() {
		wx.getLocation({
			type: 'gcj02', //返回可以用于wx.openLocation的经纬度
			success: (res) => {
				const latitude = res.latitude
				const longitude = res.longitude
				// const key = '3F5BZ-FWYWU-JUNV5-46DYM-BTCEH-ZDFGG'  // 亲铺
				// const key = 'MPHBZ-PIYCX-KQK4Q-72OJM-NWUL6-CUB2J'  // 洪荒大陆
				const key = 'UOEBZ-GLVKK-RMKJH-AXPVO-BG3TF-IVFFE' // 内购家
				// const referer = '洪荒大陆'
				const referer = '亲供'
				const location = JSON.stringify({
					latitude: latitude,
					longitude: longitude
				})
				const category = '生活服务,娱乐休闲'
				wx.navigateTo({
					url: `plugin://chooseLocation/index?key=${key}&referer=${referer}&location=${location}&category=${category}`
				});
			},
			fail: (res) => {
				wx.getSetting({
					success: function(res) {
						if (!res.authSetting['scope.userLocation']) {
							wx.showModal({
								title: '',
								content: '请允许小程序获取您的定位',
								confirmText: '授权',
								success: function(res) {
									if (res.confirm) {
			
										wx.openSetting();
									} else {
									}
								}
							})
						} else {
							//用户已授权，但是获取地理位置失败，提示用户去系统设置中打开定位
							wx.showModal({
								title: '',
								content: '请在系统设置中打开定位服务',
								confirmText: '确定',
								success: function(res) {}
							})
						}
					}
				})
			}
		})
	},
	getPickUp() {
		getApp().request({
			url: getApp().api.group.get_distance,
			data: {
				community_group_buy_id: getApp().core.getStorageSync('groupId'),
				latitude: this.data.latitude,
				longitude: this.data.longitude
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						pickList: res.data
					})
				} else if (res.code == 1) {
					wx.showModal({
						title: res.msg,
						showCancel: false
					})
				} else {
					wx.showModal({
						title: '请开启GPS定位',
						showCancel: false
					})
				}
			},
			complete: (res) => {
				wx.stopPullDownRefresh()
			}
		})
	},
	choosePick(e) {
		var pickAddress = e.currentTarget.dataset.pick
		getApp().core.setStorageSync('PICK_ADDRESS', pickAddress)
		wx.navigateBack()
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
		const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
		if (location) {
			this.setData({
				address: location.address,
				latitude: location.latitude,
				longitude: location.longitude
			})
			this.getPickUp()
		} else {
			return
		}
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
		this.getPickUp()
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},

})
