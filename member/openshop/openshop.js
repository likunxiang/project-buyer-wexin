// pages/withdrawal/withdrawal.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		x: getApp().core.getSystemInfoSync().windowWidth,
		y: getApp().core.getSystemInfoSync().windowHeight,
		user: {},
		userName: '',
		userPhone: '',
		userCode: '',
		invite_code: '',
		codeText: '获取验证码',
		getCode: 'getCode',
		wechat: '',
		isDisabled: true
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.loadData(options);
		var mch = getApp().core.getStorageSync('_mchInfo')
		this.setData({
			mch_Info: mch
		})

	},
	loadData: function(options) {
		// 获取用户信息
		let storeUser = getApp().core.getStorageSync('USER_INFO');
		if (storeUser && storeUser.length != 0) {
			this.setData({
				user: {
					nickname: storeUser.nickname,
					avatar_url: storeUser.avatar_url
				}
			})
		}
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
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {
		getApp().getStoreData();
		this.loadData();
	},

	/**
	 * 用户点击右上角分享
	 */
	// onShareAppMessage: function (options) {
	//   getApp().page.onShareAppMessage(this);
	//   var self = this;
	//   var user_info = getApp().getUser();
	//   return {
	//     path: "/pages/openshop/openshop?user_id=" + user_info.id,
	//     title: self.data.store.name
	//   };
	// },
	onHide: function() {
		getApp().page.onHide(this);
	},
	onUnload: function() {
		getApp().page.onUnload(this);
	},
	// 监视带星内容是否填写 
	changeDisabled: function() {
		var userName = this.data.userName,
			userPhone = this.data.userPhone,
			userCode = this.data.userCode,
			invite_code = this.data.invite_code,
			wechat = this.data.wechat
		if (userName && userPhone && userCode && invite_code) {
			this.setData({
				isDisabled: false
			})
		} else {
			this.setData({
				isDisabled: true
			})
		}
	},
	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},
	// 复制按钮
	copyText: function(e) {
		// TODO
		var text = e.currentTarget.dataset.text
		if (!text) {
			wx.showToast({
				title: '店主有点懒，没有绑定微信哦～',
				duration: 2500,
				icon: 'none'
			})
			return
		}
		wx.setClipboardData({
			data: text,
			success(res) {
				wx.showToast({
					title: '微信号已复制，快去粘贴吧～',
					duration: 3000
				})
				wx.getClipboardData({
					success(res) {

					}
				})
			}
		})
	},
	// 获取验证码
	getCode: function() {
		var that = this;
		var re = /^(1[3-9][0-9]{9})$/;
		if (that.data.userPhone == '') {
			wx.showToast({
				title: '请输入联系电话',
				icon: 'none',
				duration: 1500
			})
			return false;
		}
		if (!re.test(that.data.userPhone)) {
			wx.showToast({
				title: '联系电话格式不正确',
				icon: 'none',
				duration: 1500
			})
			return false;
		}
		// 发送短信
		getApp().request({
			url: getApp().api.default.sendCode,
			data: {
				phone: that.data.userPhone,
				invite_code: that.data.invite_code
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
	// 防抖赋值
	changeVal: function(e) {
		var that = this;
		var typeName = e.target.dataset.type;
		var val = e.detail.value;
		if (that.data.timeout) {
			clearTimeout(that.data.timeout);
		}
		that.data.timeout = setTimeout(function() {
			switch (typeName) {
				case 'name':
					that.setData({
						userName: val
					})
					break;
				case 'phone':
					that.setData({
						userPhone: val
					})
					break;
				case 'code':
					that.setData({
						userCode: val
					})
					break;
				case 'invite':
					that.setData({
						invite_code: val
					})
					break;
				case 'wechat':
					that.setData({
						wechat: val
					})
					break;
			}
			that.changeDisabled()
		}, 100)
	},
	// 申请开店
	openShop: function(e) {
		var status = -1
		var formId = e.detail.formId;
		var userName = this.data.userName,
			userPhone = this.data.userPhone,
			userCode = this.data.userCode,
			invite_code = this.data.invite_code,
			wechat = this.data.wechat
		if (userName == '' || userPhone == '' || userCode == '' || invite_code == '') {
			wx.showToast({
				title: '请完善信息',
				icon: 'none',
				duration: 1500
			})
			return false;
		}
		// 发送短信
		getApp().request({
			url: getApp().api.default.openShop,
			data: {
				realname: userName,
				tel: userPhone,
				code: userCode,
				invite_code: invite_code,
				formId: formId
			},
			method: 'POST',
			success: function(res) {
				if (res.code == 0) {
					wx.navigateTo({
						// url: '/pages/openshopStatus/openshopStatus?status=' + status,
						url: '/member/openshop2/openshop2'
					})
					// wx.showModal({
					// 	content: res.msg,
					// 	showCancel: false,
					// 	icon: 'none',
					// 	success: function (res) {
					// 		if (res.confirm) {

					// 		}
					// 	}
					// })

				} else {

					wx.showToast({
						title: res.msg,
						icon: 'none',
						duration: 3000
					})

				}
			}
		});
	}
})
