module.exports = {
	currentPage: null,
	/**
	 * 注意！注意！！注意！！！
	 * 由于组件的通用，部分变量名称需统一，在各自引用的xxx.js文件需定义，并给对应变量赋相应的值
	 * 以下变量必须定义并赋值
	 * 
	 * 持续补充...
	 */
	init: function(self) {
		var _this = this;
		_this.currentPage = self;
		self.setData({
			showToast: false,
			showImg: getApp().core.getStorageSync('_img').shang_chuan
		});
		if (typeof self.closeToast === 'undefined') {
			self.closeToast = function(e) {
				_this.closeToast(e);
			}
		}
		if (typeof self.toGo === 'undefined') {
			self.toGo = function(e) {
				_this.toGo(e);
			}
		}
		if (typeof self.openToast === 'undefined') {
			self.openToast = function(e) {
				_this.openToast(e);
			}
		}
		if (typeof self.getTel === 'undefined') {
			self.getTel = function(e) {
				_this.getTel(e);
			}
		}
		if (typeof self.closeTel === 'undefined') {
			self.closeTel = function(e) {
				_this.closeTel(e);
			}
		}
		getApp().request({
			url: getApp().api.default.get_shangchuan,
			data: {},
			success: (res) => {
				if (res) {
					if (res.wechat_qr_pic == 1) {
						this.currentPage.setData({
							showToast: true
						});
					}
					if (res.check_mch_tel == 1) {
						this.currentPage.setData({
							is_show_get_tel: true
						});
					}
					if (res.wechat_qr_pic == 0 && res.check_mch_tel == 1) {
						this.currentPage.setData({
							show_get_tel: true
						});
						wx.login({
							success: (res) => {
								this.currentPage.setData({
									wxCode: res.code
								});
							}
						})
					}
				}
			}
		})
	},
	getTel: function(e) {
		var self = this.currentPage;
		var _this = this;
		if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
			getApp().core.showModal({
				title: '提示',
				showCancel: false,
				content: '未授权',
			})
		} else {
			getApp().core.showLoading({
				title: '授权中',
			});
			var ivObj = e.detail.iv
			var telObj = e.detail.encryptedData
			var codeObj = self.data.wxCode;
			var that = this;
			//执行Login
			//用code传给服务器调换session_key
			// wx.getUserInfo({
			// 	success: (res) => {
			// 		console.log(res)
			// 		wx.request({
			// 			url: getApp().api.default.get_Tel,
			// 			data: {
			// 				code: data.code,
			// 				encryptedData: res.encryptedData,
			// 				iv: res.iv,
			// 			},
			// 			success: function(res) {
			// 				console.log(res)
			// 			},
			// 			fail: function(res) {
			// 				console.log('拉取用户openid失败，将无法正常使用开放接口等服务', res)
			// 			}
			// 		})

			// 		return
			// 	},
			// })
			getApp().request({
				url: getApp().api.default.get_Tel, //接口请求地址
				method: 'POST',
				data: {
					// appid: " ", //小程序appid，登录微信后台查看
					// secret: " ", //小程序secret，登录微信后台可查看
					code: codeObj,
					encrypted_data: telObj,
					iv: ivObj
				},
				//成功返回数据
				success: function(res) {
					if (res.code == 0) {
						wx.showModal({
							title: res.msg,
							cancelText: '确定',
							confirmText: '去小亲+',
							success: (res) => {
								self.setData({
									show_get_tel: false,
									showToast: false
								});
								if (res.confirm) {
									wx.navigateToMiniProgram({
										appId: 'wxfd13fd712d32b3cb',
										path: '/pages/bangdingWeChat/bangdingWeChat',
										extraData: { // 传递给目标小程序的数据，目标小程序可在 App.onLaunch，App.onShow 中获取到这份数据。
											mch_id: getApp().core.getStorageSync('_mchInfo').id,
											token: getApp().core.getStorageSync(getApp().const.ACCESS_TOKEN)
										},
										envVersion: 'trial', // 要打开的小程序版本。仅在当前小程序为开发版或体验版时此参数有效
										success(res) {
											// 打开成功

										},
										fail: function(res) {

										}
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
				},
				fail: function(res) {
					getApp().core.showModal({
						title: '提示',
						showCancel: false,
						content: '失败，请再试一次',
					})
					wx.login({
						success: (res) => {
							console.log(res.code)
							self.setData({
								wxCode: res.code
							});
						}
					})
				},
				complete: function(res) {
					getApp().core.hideLoading()
				}
			})
		}
	},
	closeToast: function() {
		var self = this.currentPage
		self.setData({
			showToast: false
		})
	},
	closeTel: function() {
		var self = this.currentPage
		self.setData({
			show_get_tel: false
		})
	},
	toGo: function() {
		var self = this.currentPage
		if (self.data.is_show_get_tel) {
			self.setData({
				show_get_tel: true
			});
			wx.login({
				success: (res) => {
					console.log(res.code)
					this.currentPage.setData({
						wxCode: res.code
					});
				}
			})
		} else {
			self.setData({
				showToast: false
			});
			wx.navigateToMiniProgram({
				appId: 'wxfd13fd712d32b3cb',
				path: '/pages/bangdingWeChat/bangdingWeChat',
				extraData: { // 传递给目标小程序的数据，目标小程序可在 App.onLaunch，App.onShow 中获取到这份数据。
					mch_id: getApp().core.getStorageSync('_mchInfo').id,
					token: getApp().core.getStorageSync(getApp().const.ACCESS_TOKEN)
				},
				envVersion: 'trial', // 要打开的小程序版本。仅在当前小程序为开发版或体验版时此参数有效
				success(res) {
					// 打开成功

				},
				fail: function(res) {

				},
			})
		}

	},
	openToast: function() {
		// var self = this.currentPage
		// self.setData({
		//   showToast: true
		// })
	}


}
