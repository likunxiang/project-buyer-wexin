var showToast = require('../../components/downLoadwx/downLoadwx.js');
var openMch = require('../../components/open50/open50.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		contact_tel: "",
		show_customer_service: 0,
		couponNum: 0,
		mch_id: 0,
		user_id: 0,
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom,
		//user_center_bg: "/images/img-user-bg.png",
		x: getApp().core.getSystemInfoSync().windowWidth,
		y: getApp().core.getSystemInfoSync().windowHeight,
		shopShow: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var self = this
		wx.hideShareMenu()
		if (getApp().core.getStorageSync('_img')) {
			var navImg = getApp().core.getStorageSync('_img')
			this.setData({
				icon_wait_pay: navImg.icon_wait_pay,
				icon_wait_send: navImg.icon_wait_send,
				icon_car: navImg.icon_car,
				icon_refund: navImg.icon_refund
			})
		}
		
		getApp().page.onLoad(this, options);
		this.setData({
			role: getApp().core.getStorageSync('role')
		})
		this.getDailySpecial()
		this.setData({
			nickName: getApp().core.getStorageSync('USER_INFO').nickname,
			avatarUrl: getApp().core.getStorageSync('USER_INFO').avatar_url,
			type: 1, //我的页面进入
			userId: getApp().core.getStorageSync('USER_INFO').id,
			mchId: getApp().core.getStorageSync('_mchInfo').id,
			storeId: getApp().core.getStorageSync('STORE').id
		})
		this.getShareData()
		this.getShareImg()
		showToast.init(this);
		openMch.init(this);
	},
	//下载图片
	downImg: function() {
		var downUrl = this.data.codeImg.qrcode_pic,
			self = this;
		if (!downUrl) {
			// 生成小程序码
			getApp().request({
				url: getApp().api.maijia.shop_qrcode,
				data: {
					page: 'pages/index/index'
				},
				success: function(res) {
					if (res.data.qrcode_pic) {
						downUrl = res.data.qrcode_pic
					}
				},
				fail: function(err) {
					if (err.msg) {
						wx.showToast({
							title: res.msg,
							icon: 'none',
							duration: 3000
						})
					}
				}
			})
		}
		wx.downloadFile({
			url: downUrl, //需要下载的图片url
			success: function(res) { //成功后的回调函数
				wx.saveImageToPhotosAlbum({ //保存到本地
					filePath: res.tempFilePath,
					success(res) {
						wx.showToast({
							title: '保存成功',
							icon: 'success',
							duration: 2000
						})
					},
					fail: function(err) {
						if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
							wx.openSetting({
								success(settingdata) {
									if (settingdata.authSetting['scope.writePhotosAlbum']) {
										self.loadData();
									} else {
										console.log('获取权限失败，给出不给权限就无法正常使用的提示')
									}
								}
							})
						}
					}
				})
			}
		});
	},
	shareShop: function() {
		var self = this;
		// 生成小程序码
		getApp().request({
			url: getApp().api.maijia.shop_qrcode,
			data: {
				page: 'pages/index/index'
			},
			success: function(res) {
				self.setData({
					shopShow: true,
					codeImg: res.data
				});
			},
			fail: function(err) {
				if (err.msg) {
					wx.showToast({
						title: res.msg,
						icon: 'none',
						duration: 3000
					})
				}
			}
		});
	},
	closeShop: function() {
		this.setData({
			shopShow: false
		});
	},
	showToMch: function() {
		this.setData({
			to_mch_show: true,
			tomch_invite_bg: getApp().core.getStorageSync('_img').invite_open_mch
		});
	},
	closeToMch: function() {
		this.setData({
			to_mch_show: false
		});
	},
	showShareModal: function() {
		var self = this
		self.setData({
			share_modal_active: "active",
			no_scroll: true,
		});
	},
	shareModalClose: function() {
		var self = this
		self.setData({
			share_modal_active: "",
			no_scroll: false,
		});
	},
	// login: function(options) {
	// 	getApp().page.onLoad(this, options);

	// },
	noLoginTips: function() {
		getApp().core.showToast({
			title: '请先登录',
			icon: 'none'
		})
	},
	myLogin: function() {
		wx.getUserInfo({
			success: function(res) {}
		})
		this.setData({
			showGetLogin: false
		})
	},
	toMch () {
		var status = this.data.vipCardStatus
		if (this.data.vipLevel<2) {
			wx.showModal({
				content: '您还不是永久会员，需先成为永久会员才能成为店主',
				confirmText: '成为会员',
				success: (res) => {
					if(res.confirm) {
						if (status == 6 || status == 7) {
							wx.navigateTo({
								url: '/member/vipFirst/vipFirst?type=1'
							})
						} else {
							wx.navigateTo({
								url: '/member/vipFirst/vipFirst'
							})
						}
						
					}
				}
			})
		} else {
			wx.navigateTo({
				url: '/pages/storeManager/storeManager'
			})
		}
	},
	openKf () {
		this.setData({
			is_show_kf: true
		})
	},
	closeKf () {
		this.setData({
			is_show_kf: false
		})
	},
	toMchPage () {
		this.closeKf()
		wx.navigateTo({
			url: '/member/homePage/homePage'
		})
	},
	checkApply() {
		// 0 已上传实名信息并处在试用期或已付费--正常使用 
		// 1 店铺被封了--不给进,显示msg的信息 
		// 2 还未开通--跳到开通页面 
		// 3 过了试用期--跳支付页面 
		// 4 还未上传身份信息--跳上传身份信息页面
		getApp().request({
			url: getApp().api.selfSupport.check_apply,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id
			},
			success: (res) => {
				if (res.code == 0) {

					this.setData({
						privateUrl: '/private/home/home?type=2'
					})

				}
				if (res.code == 1) {
					this.setData({
						privateUrl: "/private/privateService/privateService?type=2"
					})
				}
				if (res.code == 2) {
					this.setData({
						privateUrl: "/private/privateService/privateService?type=2"
					})
				}
				if (res.code == 4) {
					this.setData({
						privateUrl: "/private/submitMaterial/submitMaterial"
					})
				}
			}
		})
	},
	logout: function() {
		wx.showModal({
			title: '提示',
			content: '是否注销登录',
			success: function(res) {
				if (res.confirm) {

					wx.clearStorage()
					wx.redirectTo({
						url: '/pages/user/user'
					})

				}
			}
		})


	},
	// 邀请会员
	showModal() {
		this.setData({
			is_show_model: true,
			card_bg: getApp().core.getStorageSync('_img').b1,
		})
		this.getShareImg()
		
	},
	closeModal() {
		this.setData({
			is_show_model: false
		})
	},
	// getAut:function () {
	// 	wx.getSetting({
	// 	  success (res) {
	// 	    console.log(res.authSetting)
	// 	    // res.authSetting = {
	// 	    //   "scope.userInfo": true,
	// 	    //   "scope.userLocation": true
	// 	    // }
	// 	  }
	// 	})
	// },
	// 跳转到卖家端
	toSeller: function() {

		wx.navigateToMiniProgram({
			// appId: 'wx5e79a4f1d637b9bf',
			appId: 'wxfd13fd712d32b3cb',
			path: '/pages/index/index',
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
	},
	// 上传微信 
	toSellerUploadWX: function() {
	
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
	
	},
	toQinBook () {
		wx.navigateTo({
			url: '/user/qinBook/qinBook'
		})
	},
	getDailySpecial: function() {
		var self = this
		getApp().request({
			url: getApp().api.default.banner_list,
			success(res) {
				if (res.code == 0) {

					self.setData({
						dailySpecial: res.data,
					})
				}
			}
		})
	},
	getVipCardStatus () {
		getApp().request({
			url: getApp().api.default.vip_card_status,
			success: (res) => {
				if (res.code == 0) {
					var bgUrl = this.data.bg
					var bg = ''
					if(res.data.level < 0) {
						bg = bgUrl.c
					} else {
						bg = bgUrl.a
					}
					this.setData({
						vipCardStatus: res.data.status,
						vipCardTime: res.data.msg,
						vipLevel: res.data.level,
						bg: bg,
						tomch_self_bg: getApp().core.getStorageSync('_img').ms_chengwei_mch
					})
				}
			}
		})
	},
	// 跳转到设置页
	toSetting: function() {
		var self = this
		getApp().core.navigateTo({
			url: '/pages/setting/setting'
		})
	},
	toMyTop() {
		getApp().core.navigateTo({
			url: '/member/myTop/myTop'
		})
	},
	loadData: function(options) {
		var self = this;
		self.setData({
			store: getApp().core.getStorageSync(getApp().const.STORE)
		});
		getApp().request({
			url: getApp().api.user.index,
			success: function(res) {
				if (res.code == 0) {
					if (self.data.__platform == 'my') {
						var menus = res.data.menus;
						menus.forEach(function(item, index, array) {
							if (item.id === 'bangding') {
								res.data.menus.splice(index, 1, 0);
							}
						});
					}
					if (res.data.tmp_id) {
						getApp().core.setStorageSync('refundId', res.data.tmp_id.refund_tpl || '')
						getApp().core.setStorageSync('sendId', res.data.tmp_id.send_tpl || '')
					}
					var buy_mch = res.data.user_info.buy_mch
				
					if (buy_mch.open_member == 1 && buy_mch.user_jur == 1) {
						var can_shopkeeper = 1
					} else {
						var can_shopkeeper = 0
					}
					self.setData({
						group_order_no_pay_num: res.data.group_order_no_pay_num,
						applyStatus: res.data.mch.review_status, // 申请开店审核状态
						is_close: res.data.mch.is_close, // 店铺是否被关闭
						open_step: res.data.user_info.open_step,
						subsidy: res.data.user_info.subsidy,  // 津贴数量
						bg: res.data.banner_img,  // a会员背景;b会员卡背景;c非会员背景
						vipCardBg: res.data.banner_img.b,
						can_shopkeeper: can_shopkeeper ,// 是否可以购买小亲
						kf_service: res.data.kf_service,  // 客服是否在线 0不在 1在线
						kf_service_tips: res.data.kf_service_tips, // 客服描述
						is_show_open50: res.data.user_info.tips,  // 1不提示  0提示
					})
					self.setData(res.data);
					self.getVipCardStatus()
					getApp().core.setStorageSync(getApp().const.PAGES_USER_USER, res.data);
					getApp().core.setStorageSync(getApp().const.SHARE_SETTING, res.data.share_setting);
					getApp().core.setStorageSync(getApp().const.USER_INFO, res.data.user_info);
				}
			}
		});
		// 现金券数量
		// getApp().request({
		//   url: getApp().api.coupon.index,
		//   data: {
		//     status: 0,
		//   },
		//   success: function (res) {
		//     if (res.code == 0) {
		//       self.setData({
		//         couponNum: res.data.list.length,
		//       });
		//     }
		//   },
		// });
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function(options) {
		getApp().page.onReady(this);

	},
	kf() {
		wx.getStorage({
			key: 'USER_INFO',
			success(user) {
				wx.getStorage({
					key: '_mchInfo',
					success(mch) {
						wx.navigateTo({
							url: '/pages/web/web?user_id=' + user.data.id + '&mch_id=' + mch.data.id,
						})
					}
				})
			}
		})
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function(options) {
		getApp().page.onShow(this);
		var self = this;
		self.checkApply()
		self.loadData();
	},

	callTel: function(e) {
		var tel = e.currentTarget.dataset.tel;
		getApp().core.makePhoneCall({
			phoneNumber: tel, //仅为示例，并非真实的电话号码
		});
	},
	apply: function(e) {
		var self = this;
		var share_setting = getApp().core.getStorageSync(getApp().const.SHARE_SETTING);
		var user_info = getApp().getUser();
		if (share_setting.share_condition == 1) {
			getApp().core.navigateTo({
				url: '/pages/add-share/index',
			})
		} else if (share_setting.share_condition == 0 || share_setting.share_condition == 2) {
			if (user_info.is_distributor == 0) {
				getApp().core.showModal({
					title: "申请成为分销商",
					content: "是否申请？",
					success: function(r) {
						if (r.confirm) {
							getApp().core.showLoading({
								title: "正在加载",
								mask: true,
							});
							getApp().request({
								url: getApp().api.share.join,
								method: "POST",
								data: {
									form_id: e.detail.formId
								},
								success: function(res) {
									if (res.code == 0) {
										if (share_setting.share_condition == 0) {
											user_info.is_distributor = 2;
											getApp().core.navigateTo({
												url: '/pages/add-share/index',
											})
										} else {
											user_info.is_distributor = 1;
											getApp().core.navigateTo({
												url: '/pages/share/index',
											})
										}
										getApp().core.setStorageSync(getApp().const.USER_INFO, user_info);
									}
								},
								complete: function() {
									getApp().core.hideLoading();
								}
							});
						}
					},
				})
			} else {
				getApp().core.navigateTo({
					url: '/pages/add-share/index',
				})
			}
		}
	},
	verify: function(e) {
		getApp().core.scanCode({
			onlyFromCamera: false,
			success: function(res) {
				getApp().core.navigateTo({
					url: '/' + res.path,
				})
			},
			fail: function(e) {
				getApp().core.showToast({
					title: '失败'
				});
			}
		});
	},
	member: function() {
		getApp().core.navigateTo({
			url: '/pages/member/member',
		})
	},

	clearCache: function() {
		wx.showActionSheet({
			itemList: [
				'清除缓存',
			],
			success(res) {
				if (res.tapIndex === 0) {
					wx.showLoading({
						title: '清除中...',

					});
					setTimeout(function() {
						wx.hideLoading();
					}, 1000);
				}
			}
		})
	},
	// 申请开店
	openShop: function(e) {
		var self = this
		var status = self.data.open_step
		if (status == 5) {
			status = self.data.applyStatus
			if (status == 0) {
				wx.navigateTo({
					url: '/member/openshopStatus/openshopStatus?status=1'
				});
				return
			}
			if (status == 2) {
				wx.navigateTo({
					url: '/member/openshopStatus/openshopStatus?status=2'
				});
				return
			}
		} else {
			if (status == 0) {
				wx.navigateTo({
					url: '/member/openshopArticle/openshopArticle',
				});
				return
			}
			if (status == 1) {
				wx.navigateTo({
					url: '/member/openshop2/openshop2',
				});
				return
			}
			if (status == 2) {
				wx.navigateTo({
					url: '/member/openshop3/openshop3',
				});
				return
			}
			//是否已申请
			getApp().request({
				url: getApp().api.mch.apply,
				success: function(res) {

					if (res.code == 0) {
						if (!res.data.apply) {
							wx.navigateTo({
								url: '/member/openshopArticle/openshopArticle',
							});
						} else {
							if (res.data.apply.review_status == 0 || res.data.apply.review_status == 2) {
								wx.navigateTo({
									url: '/member/openres/openres',
								})
							}
						}
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
		}
		wx.navigateTo({
			url: '/member/newOpenShop/newOpenShop',
		});
	},
	// 分享会员
	getShareData() {
		getApp().request({
			url: getApp().api.default.share_data,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						parent_id: res.data.parent_id,
						store_id: res.data.store_id,
						store_group_id: res.data.store_group_id,
						sid: res.data.id
					})
				} 
				// else {
				// 	wx.showToast({
				// 		title: res.msg,
				// 		icon: 'none'
				// 	})
				// }
			}
		})
	},
	getShareImg() {
		getApp().request({
			url: getApp().api.default.vip_share_img,
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						shareImg: res.data.vipImg
					})
				}
			}
		})
	},
	shareVip() {
		getApp().request({
			url: getApp().api.default.share_vip,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
			}
		})
	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function(options) {
		var type = options.target.dataset.type
		var mch_id = wx.getStorageSync('_mchInfo').id;
		var user_id = getApp().core.getStorageSync('USER_INFO').id
		var nickname = getApp().core.getStorageSync('USER_INFO').nickname
		
		var img = this.data.shareImg
		if (type == "tomch") {
			var title = nickname + '邀请您一起开店，快来赚钱吧'
			img = getApp().core.getStorageSync('_img').invite_open_mch_black
			return {
				title: title,
				path: '/pages/storeInvite/storeInvite?sid=' + this.data.sid + '&type=1' + '&mch_id=' + mch_id + '&user_id=' + user_id,
				imageUrl: img
			}
		} else {
			this.shareVip()
			var title = nickname + ' 送你一张超值会员卡，大家一起省钱啊，感恩～'
			return {
				title: title,
				path: '/member/getVipCard/getVipCard?sid=' + this.data.sid + '&type=1' + '&mch_id=' + mch_id + '&user_id=' + user_id + '&share_vip_type=1',
				imageUrl: img
			}
		}
		
		
	}
});
