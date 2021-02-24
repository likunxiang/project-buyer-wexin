var gSpecificationsModel = require('../../components/goods/specifications_model.js'); //商城多规格选择
var goodsBuy = require('../../components/goods/goods_buy.js');
var toTop = require('../../components/toTop/toTop.js')
var interval = 0;
var page_first_init = true;
var timer = 1;
var fullScreen = false;
var app = getApp();

// 日期格式转换
// dateFormat("YYYY-mm-dd HH:MM:SS", 秒时间戳)
function dateFormat(fmt, timestamp) {
	var date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
	var Y = date.getFullYear() + '-';
	var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
	var D = date.getDate() + ' ';
	var h = date.getHours() + ':';
	var m = date.getMinutes() + ':';
	var s = date.getSeconds();
	var datas = new Date(Y + M + D + h + m + s);
	let ret;
	let opt = {
		"Y+": datas.getFullYear().toString(), // 年
		"m+": (datas.getMonth() + 1).toString(), // 月
		"d+": datas.getDate().toString(), // 日
		"H+": datas.getHours().toString(), // 时
		"M+": datas.getMinutes().toString(), // 分
		"S+": datas.getSeconds().toString() // 秒
		// 有其他格式化字符需求可以继续添加，必须转化成字符串
	};
	for (let k in opt) {
		ret = new RegExp("(" + k + ")").exec(fmt);
		if (ret) {
			fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
		};
	};
	return fmt;
}
Page({
	data: {
		store_id: 0, //是否有店铺
		x: getApp().core.getSystemInfoSync().windowWidth,
		y: getApp().core.getSystemInfoSync().windowHeight,
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom,
		left: 0,
		show_notice: false,
		animationData: {},
		play: -1,
		time: 0,
		buy: false,
		opendate: false,
		onUp: false,
		user: {},
		boxShow: false,
		first: false,
		hasCps: false,
		module_list: [],
		couponsList: [],
		signList: [],
		signPriceList: [],
		showCoupon: false,
		active2: '2',
		is_shoper: true,
		stopLoadMore: false,
		page: 1,
		loadingSwitch: true,
		show_attr_picker: false, // 购物车
		is_show_modal: false, // 首单会员
		member_show_Menmodal: false, //恭喜你遮罩层
		bar_title: '',
		memberCode: 0,
		Memberlist: [], //放恭喜数据库
		list: [],
		is_top: false, // 到顶部按钮
	},
	// 购物车相关
	openCart(e) {
		var id = e.currentTarget.dataset.id
		var goods = e.currentTarget.dataset.list
		this.setData({
			show_attr_picker: true,
			goods: goods,
			['form.number']: 1
		})
		this.getGoodsAttr(id)
	},
	getGoodsAttr: function(id) {
		var self = this
		getApp().request({
			url: getApp().api.default.goods_attr,
			data: {
				id: id,
				from: self.data.goods.from || 1
			},
			success: function(res) {
				if (res.code == 0) {
					if (res.data.attr[0].num == 0) {
						for (var i in res.data.attr) {
							if (res.data.attr[i].num > 0) {
								res.data.attr[0].total_num = true
								break;
							}

						}
					}
					self.setData({
						goods_attr: res.data.attr,
						attr_group_list: res.data.attr_group_list,
					});
					if (res.data.attr != null && res.data.attr_group_list != null) {
						self.selectDefaultAttr(res.data);
					}

				}

			}
		})
	},
	getJXnav() {
		getApp().request({
			url: getApp().api.group.index_jx_nav,
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						jxNavList: res.data
					})
				} else {

				}
			}
		})
	},
	//加入购物车
	addCart: function() {
		var self = this
		var token = getApp().core.getStorageSync('ACCESS_TOKEN')
		if (!token) {
			self.setData({
				showGetLogin: true,
				user_info_show: true,
			})
			return
		}
		this.submit('ADD_CART');
	},
	submit: function(type) {
		var self = this
		if (self.data.form.number > self.data.goods.num) {
			getApp().core.showToast({
				title: "商品库存不足，请选择其它规格或数量",
				icon: 'none'
			});
			return true;
		}
		if (type == 'ADD_CART') { //加入购物车
			getApp().core.showLoading({
				title: "正在提交",
				mask: true,
			});
			getApp().request({
				url: getApp().api.cart.add_cart,
				method: "POST",
				data: {
					goods_id: self.data.goods.id,
					sku: self.data.goods.sku,
					num: self.data.form.number,
					from: self.data.goods.from || 1
				},
				success: function(res) {
					getApp().core.hideLoading();
					getApp().core.showToast({
						title: res.msg,
						duration: 1500,
						icon: 'none'
					});
					self.setData({
						show_attr_picker: false,
					});

				}
			});
		}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var self = this;
		getApp().getStoreData(options);
		toTop.init(this)
		app.trigger.remove(app.trigger.events.set_mch, 'AFTER_SET_MCH_INFO');
		app.trigger.add(app.trigger.events.set_mch, 'AFTER_SET_MCH_INFO', function() {
			app.mch_id && self.getInitInfo(self);
		});
		app.page.onLoad(this, options);
		let showCoupon = false;
		if (getApp().showCoupon) {
			showCoupon = true;
		}
		this.setData({
			options: options,
			showCoupon: showCoupon,
			role: app.core.getStorageSync('role'),
		});
		this.getJXnav()
		// getApp().core.fenye(this.data)

		this.checkTips()
		this.getVipCardStatus()
		this.getShareData()
		this.getShareImg()
		this.getBuyCatsList()
	},
	// 通知滚动直接手动滚动
	// stopTouchMove: function() {
	//   return false;
	// },

	// 跳转到卖家端
	toSeller: function() {
		//console.log('我想跳转到卖家端');
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
			fail: function(res) {}
		})

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
	// 获取每日推荐分类
	getBuyCatsList() {
		getApp().request({
			url: getApp().api.default.buy_cats_list,
			data: {
				showSite: 1
			},
			success: (res) => {
				if (res.code == 0 ) {
					console.log(res);
					var catsList = res.data
					this.setData({
						newActsList: catsList
					})
					console.log(this.data.newActsList);
					for (let i in catsList) {
						this.getBuyActsList(catsList[i].id,i,catsList[i].name)
					}
				}
			},
			complete: (res) => {
				getApp().core.hideLoading();
			}
		});
	},
	getBuyActsList(id,i) {
		var newActsList = this.data.newActsList
		getApp().request({
			url: getApp().api.default.buy_acts_list,
			data: {
				circleType: id
			},
			success: (res) => {
				if (res.code == 0 ) {
					newActsList[i].list = res.data.list
					
					this.setData({
						newActsList: newActsList
					})
					console.log(this.data.newActsList);
					// console.log(res);
				}
			},
		})
	},

	/**
	 * 加载页面数据
	 */
	loadData: function(options) {
		var self = this;
		// var pages_index_index = getApp().core.getStorageSync(getApp().const.PAGE_INDEX_INDEX);
		// if (pages_index_index) {
		// 	pages_index_index.act_modal_list = [];
		// 	self.setData(pages_index_index);
		// }

		// 获取用户信息
		let storeUser = getApp().core.getStorageSync('USER_INFO');

		if (storeUser && storeUser.length != 0) {
			self.setData({
				user: {
					nickname: storeUser.nickname,
					avatar_url: storeUser.avatar_url
				}
			})
		}
		getApp().core.showLoading({
			title: '加载中'
		})
		self.getBannerOther()
	},
	getPrivateGoods() {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_goods_index,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success(res) {
				self.setData({
					privateList: res.data
				})
			},
			complete(res) {
				self.getMiaosha()
			}

		})
	},
	// 获取状态
	getVipCardStatus() {
		getApp().request({
			url: getApp().api.default.vip_card_status,
			success: (res) => {
				if (res.code == 0) {
					var vipLevel = res.data.level
					var vipCardStatus = res.data.status
					var vipUrl = ''
					var change_xq = false
					var bg_pic = getApp().core.getStorageSync('_img').huang_guan
					var share_vip_type = getApp().core.getStorageSync('share_vip_type')
					if (getApp().core.getStorageSync('u_id') && vipCardStatus != 0 && share_vip_type == 1) {
						vipUrl = '/member/getVipCard/getVipCard?type=1&user_id=' + getApp().core.getStorageSync('u_id') + '&sid=' +
							getApp().core.getStorageSync('s_id')
						bg_pic = getApp().core.getStorageSync('_img').member_wait_lq
					} else {
						if (vipCardStatus == 1 || vipCardStatus == 2 || vipCardStatus == 3) {
							vipUrl = '/member/vipFirst/vipFirst'
							bg_pic = getApp().core.getStorageSync('_img').member_apply
						}
						if (vipCardStatus == 5) {
							// 申请会员
							vipUrl = '/member/vipFirst/vipFirst?type=1'
							bg_pic = getApp().core.getStorageSync('_img').member_share
						}
						if (vipCardStatus == 4) {
							// 分享会员
							vipUrl = '/member/getVipCard/getVipCard'
							bg_pic = getApp().core.getStorageSync('_img').member_apply
						}

						if (vipCardStatus == 6 || vipCardStatus == 7) {
							// 申请会员
							vipUrl = '/member/vipFirst/vipFirst?type=1'
							bg_pic = getApp().core.getStorageSync('_img').member_apply
						}
						if (vipCardStatus == 0) {
							vipUrl = '/pages/storeManager/storeManager'
							bg_pic = getApp().core.getStorageSync('_img').subsidy_100
							change_xq = true
						}
					}


					this.setData({
						vipUrl: vipUrl,
						bg_pic: bg_pic,
						change_xq: change_xq
					})
				}
			}
		})
	},
	// 邀请会员
	showModalVip() {
		this.setData({
			is_show_model: true,
			card_bg: getApp().core.getStorageSync('_img').b1,
		})
		this.getShareImg()

	},
	closeModalVip() {
		this.setData({
			is_show_model: false
		})
	},

	// 社区团购相关
	// checkGroupGoods() {
	// 	getApp().request({
	// 		url: getApp().api.group.check_group,
	// 		success: (res) => {
	// 			if (res.code == 0) {
	// 				wx.authorize({
	// 					scope: "scope.userLocation",
	// 				})
	// 				let id = res.data.id
	// 				this.setData({
	// 					groupId: id,
	// 					groupNotice: res.data.notice
	// 				})
	// 				if (!getApp().core.setStorageSync('groupId', id)) {
	// 					getApp().core.setStorageSync('groupId', id)
	// 				}
	// 				this.getGroupGoods(id)
	// 			} else {}
	// 		}
	// 	})
	// },
	// getGroupGoods(id) {
	// 	getApp().request({
	// 		url: getApp().api.group.group_list,
	// 		data: {
	// 			community_group_buy_id: id,
	// 		},
	// 		success: (res) => {
	// 			if (res.code == 0) {
	// 				this.setData({
	// 					['module_list.groupList']: res.data.list,
	// 				});
	// 				this.getActivityList()
	// 			} else {
	// 				wx.showModal({
	// 					title: res.msg,
	// 					showCancel: false,
	// 				})
	// 				this.getActivityList()
	// 			}
	// 		},
	// 		complete: (res) => {

	// 		}
	// 	})
	// },
	getMiaosha: function() {
		var self = this
		getApp().request({
			url: getApp().api.default.miaosha_list,
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						'module_list.miaosha': res.data,
					});
					// getApp().core.setStorageSync(getApp().const.PAGE_INDEX_INDEX, res.data);
					// self.miaoshaTimer();
				}
			},
			complete: function() {
				self.getPintuan()
				getApp().core.stopPullDownRefresh();
			}
		});
	},
	// miaoshaScorll () {
	// 	var self = this
	// 	var index = 0
	// 	var setTime = setInterval(function(){
	// 		if (index<self.data.module_list.miaosha.length-1) {
	// 			index++
	// 			console.log(index);
	// 			self.setData({
	// 				mtview: 'date' + index
	// 			})
	// 		} else {
	// 			clearInterval(setTime)
	// 			self.setData({
	// 				mtview: 'date' + 0
	// 			})
	// 			self.miaoshaScorll()
	// 		}
	// 	},2000)
	// },
	getPintuan: function() {
		var self = this
		getApp().request({
			url: getApp().api.default.pintuan_list,
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						'module_list.pintuan': res.data,
					});
					// getApp().core.setStorageSync(getApp().const.PAGE_INDEX_INDEX, res.data);
					// self.miaoshaTimer();
				}
			},
			complete: function() {
				// self.checkGroupGoods()
				self.getActivityList()
				getApp().core.stopPullDownRefresh();
			}
		});
	},
	getActivityList: function() {
		var self = this
		getApp().request({
			url: getApp().api.default.activity_list,
			success: function(res) {
				if (res.code == 0) {
					for (let x in res.data) {
						var catsArr = res.data[x].cats
						var arr = []
						for (let i in catsArr) {
							var obj = {
								id: i,
								catsName: catsArr[i],
							}
							arr.push(obj)
						}
						res.data[x].cats = arr
					}
					self.setData({
						['module_list.huodongs[0]']: res.data,
					});
					self.getMore()
				}
			},
			complete: function() {
				getApp().core.hideLoading()
			}
		})
	},
	// getMchGoods: function() {
	// 	var self = this
	// 	getApp().request({
	// 		url: getApp().api.default.mch_goods,
	// 		success: function(res) {
	// 			if (res.code == 0) {
	// 				self.setData({
	// 					['module_list.tuijian']: res.data,
	// 				});
	// 			}
	// 		},
	// 		complete: function() {
	// 			self.getActivityList()
	// 		}
	// 	})
	// },
	getBannerOther: function() {
		var self = this
		getApp().request({
			url: getApp().api.default.index_other,
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						module_list: res.data,
					});
					self.getPrivateGoods()
				}
			}
		})
	},
	getMore: function() {
		var self = this
		var url = getApp().api.default.activity_list
		var data = {}
		getApp().core.pading(self, url, data, function(res, index) {
			if (res.data.length == 0) {
				self.setData({
					stopLoadMore: true,
					is_no_more: true
				})
				return
			}
			for (let x in res.data) {
				var catsArr = res.data[x].cats
				var arr = []
				for (let i in catsArr) {
					var obj = {
						id: i,
						catsName: catsArr[i],
					}
					arr.push(obj)
				}
				res.data[x].cats = arr
			}
			self.setData({
				["module_list.huodongs[" + index + "]"]: res.data,
				loadingSwitch: true
			});
			var query = wx.createSelectorQuery();
			query.select('.index-body').boundingClientRect(function(rect) {
				self.setData({
					bodyHeight: rect.height,
				})
			}).exec();
		})
	},
	onPageScroll: function(e) {
		var self = this;
		var top = e.scrollTop
		var touchTop = top + 300
		var loadingSwitch = self.data.loadingSwitch

		var height = self.data.bodyHeight / 2
		if (touchTop > height && loadingSwitch) {
			self.setData({
				loadingSwitch: false
			})
			for (var i = 0; i < 4; i++) {
				self.getMore()
			}
		}
		if (top >= 600 && !self.data.is_top) {
			self.setData({
				is_top: true
			})
		}
		if (top < 600 && self.data.is_top) {
			self.setData({
				is_top: false
			})
		}
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		var self = this;
		gSpecificationsModel.init(this);
		this.checkFirstOrder()
		goodsBuy.init(this);
		var pickAddress = getApp().core.getStorageSync('PICK_ADDRESS')
		app.page.onShow(this);
		self.setData({
			is_shoper: true,
			pickAddress: pickAddress
		})
		var query = wx.createSelectorQuery()
		query.select('#header').boundingClientRect(function(res) {
			self.setData({
				headerHeigh: res.height
			})
		}).exec();
	},

	// 获取初始化数据
	getInitInfo: function(self) {
		self.setData({
			mch: app.core.getStorageSync('_mchInfo'),
			role: app.core.getStorageSync('role'),
			header_bg: app.core.getStorageSync('_mchInfo').header_bg
		});
		self.loadData(self.data.options);
		app.getConfig(function(config) {
			let store = config.store;
			if (store && store.name) {
				self.setData({
					bar_title: store.name
				});
				getApp().core.setNavigationBarTitle({
					title: store.name,
				});
			}
		});
	},
	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {
		getApp().getStoreData();
		clearInterval(timer);
		this.loadData();
		this.setData({
			page: 1,
			stopLoadMore: false,
			is_no_more: false
		})
	},
	closeShop: function() {
		this.setData({
			shopShow: false
		});
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
		self.shareModalClose()
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
	onReady: function(e) {},
	/**
	 * 页面相关事件处理函数--监听用户上拉动作
	 */
	onReachBottom: function() {
		this.setData({
			onUp: true
		})
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
			success: (res) => {}
		})
	},
	onShareAppMessage: function(options) {
		var self = this
		self.setData({
			is_shoper: false
		})


		if (options.from === 'button') {
			if (options) {
				var id = options.target.dataset.id;
				var url = options.target.dataset.url;
				var name = options.target.dataset.name;
				var type = options.target.dataset.type;
			}
			if (id > 0) {
				var user_info = getApp().getUser();
				var mch_info = wx.getStorageSync('_mchInfo');
				return {
					path: "/pages/goods/goods?id=" + id + "&user_id=" + user_info.id + "&mch_id=" + mch_info.id,
					title: name,
					imageUrl: url,
				}
			}
			if (id < 0) {
				self.shareModalClose()
				var user_info = getApp().getUser();
				var mch_info = wx.getStorageSync('_mchInfo');
				return {
					path: "/pages/index/index?user_id=" + user_info.id + "&mch_id=" + mch_info.id,
					title: mch_info.name
				};
			}
			if (type = 'share_vip') {
				var mch_id = wx.getStorageSync('_mchInfo').id;
				var user_id = getApp().core.getStorageSync('USER_INFO').id
				var nickname = getApp().core.getStorageSync('USER_INFO').nickname
				var title = nickname + ' 送你一张超值会员卡，大家一起省钱啊，感恩～'
				var img = this.data.shareImg
				this.shareVip()
				return {
					title: title,
					path: '/member/getVipCard/getVipCard?sid=' + this.data.sid + '&type=1' + '&mch_id=' + mch_id + '&user_id=' +
						user_id + '&share_vip_type=1',
					imageUrl: img
				}
			}
		} else {
			var user_info = getApp().getUser();
			var mch_info = wx.getStorageSync('_mchInfo');
			return {
				path: "/pages/index/index?user_id=" + user_info.id + "&mch_id=" + mch_info.id,
				title: mch_info.name
			};
		}

	},


	notice: function() {
		var self = this;
		var notice = self.data.notice;
		if (notice === undefined) {
			return;
		}
		var length = notice.length * 14;
		return;
	},

	onHide: function() {
		getApp().page.onHide(this);
		this.setData({
			play: -1
		});
		clearInterval(interval);
	},
	onUnload: function() {
		getApp().page.onUnload(this);
		this.setData({
			play: -1
		});
		clearInterval(timer);
		clearInterval(interval);
	},
	showNotice: function() {
		this.setData({
			show_notice: true
		});
	},
	closeNotice: function() {
		this.setData({
			show_notice: false
		});
	},

	to_dial: function() {
		var contact_tel = this.data.store.contact_tel;
		getApp().core.makePhoneCall({
			phoneNumber: contact_tel
		})
	},

	closeActModal: function() {
		var self = this;
		var act_modal_list = self.data.act_modal_list;
		var show_next = true;
		var next_i;
		for (var i in act_modal_list) {
			var index = parseInt(i);
			if (act_modal_list[index].show) {
				act_modal_list[index].show = false;
				next_i = index + 1;
				if (typeof act_modal_list[next_i] != 'undefined' && show_next) {
					show_next = false;
					setTimeout(function() {
						self.data.act_modal_list[next_i].show = true;
						self.setData({
							act_modal_list: self.data.act_modal_list
						});
					}, 500);
				}
			}
		}
		self.setData({
			act_modal_list: act_modal_list,
		});
	},
	naveClick: function(e) {
		var self = this;
		getApp().navigatorClick(e, self);
	},
	play: function(e) {
		this.setData({
			play: e.currentTarget.dataset.index
		});
	},

	fullscreenchange: function(e) {
		if (e.detail.fullScreen) {
			fullScreen = true;
		} else {
			fullScreen = false;
		}
	},
	// 关闭弹窗
	closeActModal: function() {
		this.setData({
			boxShow: false,
			first: false,
			hasCps: false,
			showCoupon: false
		})
		getApp().showCoupon = false
	},

	//检测恭喜你或者是太可惜的提示
	checkTips() {
		if (getApp().core.setStorageSync('member_tips')) {
			return
		}

		getApp().request({
			url: getApp().api.LockPowder.check_tips,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
				getApp().core.setStorageSync('member_tips', 1)
				if (res.code == 0) {
					this.setData({
						member_show_Menmodal: false,
						memberCode: res.code
					})
				} else if (res.code == 1) {
					if (getApp().core.getStorageSync('member_tips') == 1) {
						this.setData({
							member_show_Menmodal: true,
							memberCode: res.code,
							Memberlist: res.data,
							list: res.data.list
						})
					}
				} else {
					if (getApp().core.getStorageSync('member_tips') == 1) {
						this.setData({
							member_show_Menmodal: true,
							memberCode: res.code,
							Memberlist: res.data,
							list: res.data.list
						})
					}
				}
			}
		})
	},

	//残忍拒绝
	reject() {
		this.setData({
			member_show_Menmodal: false
		})
		getApp().core.setStorageSync('member_tips', 0)
	}
});
