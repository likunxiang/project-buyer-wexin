// pages/newOpenShop/newOpenShop.js
import util from '../../utils/util.js'
const chooseLocation = requirePlugin('chooseLocation');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		is_ready: false,
		codeText: '获取验证码',
		getCode: 'getCode',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		getApp().page.onLoad(this, options);
		this.getBackground()
		var self = this;
	},
	getBackground () {
		getApp().request({
			url: getApp().api.group.get_pick_backgroud,
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						pickBackground: res.data.banner,
						fwxy_id: res.data.fwxy,
						fwxy_title: res.data.fwxy_title
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
				const key = 'UOEBZ-GLVKK-RMKJH-AXPVO-BG3TF-IVFFE'  // 亲供
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
			}
		})
	},
	inviteInput(e) {
		this.setData({
			inviteCode: e.detail.value
		})
	},
	nameInput(e) {
		this.setData({
			nameValue: e.detail.value
		})
	},
	mobileInput(e) {
		this.setData({
			mobileValue: e.detail.value
		})
	},
	codeInput(e) {
		this.setData({
			codeValue: e.detail.value
		})
	},
	communityInput(e) {
		this.setData({
			communityValue: e.detail.value
		})
	},
	detailInput(e) {
		this.setData({
			detailValue: e.detail.value
		})
	},
	ready() {
		this.setData({
			is_ready: !this.data.is_ready
		})
	},
	submitMsg() {
		if (this.data.inviteCode && this.data.nameValue && this.data.mobileValue && this.data.codeValue && this.data.communityValue && this.data.detailValue &&
			this.data.address) {
			if (!this.data.is_ready) {
				wx.showToast({
					title: '请先勾选阅读相关协议',
					icon: 'none'
				})
				return false
			}
		} else {
			wx.showToast({
				title: '你还有信息没填或格式错误',
				icon: 'none'
			})
			return false
		}
		getApp().request({
			url: getApp().api.group.open_shop,
			method: 'POST',
			data: {
				invite_code: this.data.inviteCode,
				code: this.data.codeValue,
				tel: this.data.mobileValue,
				latitude: this.data.latitude,
				longitude: this.data.longitude,
				realname: this.data.nameValue,
				dispatching_name: this.data.communityValue,
				address: this.data.address + this.data.detailValue,
			},
			success: (res) => {
				if (res.code == 0) {
					wx.showModal({
						title: '提交成功',
						showCancel: false,
						success: (res) => {
							if (res.confirm) {
								wx.redirectTo({
									url: '/pages/openshopStatus/openshopStatus?status=0'
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
	// 获取验证码
	getCode: function() {
		var that = this;
		if (that.data.mobileValue == '' || that.data.mobileValue.length != 11) {
			wx.showToast({
				title: '请输入正确的联系电话',
				icon: 'none',
				duration: 1500
			})
			return false;
		}
		// 发送短信
		getApp().request({
			url: getApp().api.default.sendCode,
			data: {
				phone: that.data.mobileValue,
				type: '3'
			},
			method: 'POST',
			success: function(res) {
				if (res.code == 0) {
					var count = 60;
					wx.showToast({
						title: '验证码发送成功',
						icon: 'none',
						duration: 1500
					})
					var timer = setInterval(function() {
						count--;
						if (count >= 1) {
							that.setData({
								codeText: count + ' S',
								getCode: ''
							})
						} else {
							that.setData({
								codeText: '重新获取',
								getCode: 'getCode'
							})
							clearInterval(timer);
						}
					}, 1000);
				} else {
					if (res.msg) {
						wx.showToast({
							title: res.msg,
							icon: 'none',
							duration: 1500
						})
					}
				}
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
		const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
		if (location) {
			this.setData({
				address: location.address,
				latitude: location.latitude,
				longitude: location.longitude
			})
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

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},
})
