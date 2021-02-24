module.exports = {
	currentPage: null,
	currentPageOptions: {},
	current_mchid: '',
	//加入底部导航的页面
	navbarPages: [
		'pages/index/index',
		'pages/cart/cart',
		'pages/user/user',
		'pages/list/list',
		'pages/video/video-list',
		'pages/miaosha/miaosha',
		'pages/quick-purchase/index/index',
		'pages/integral-mall/index/index',
		'pages/integral-mall/register/index',
		'pages/article-detail/article-detail',
		'pages/article-list/article-list',
		'pages/order/order',
		'pages/guanyiguan/guanyiguan',
		'pages/liveRoom/liveRoom'
	],
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(self, options) {
		var app = getApp();
		let showGetLogin = true;
		if (self.route == 'pages/index/index' || self.route == 'pages/guanyiguan/guanyiguan' || self.route == 'pages/newSearch/newSearch' || self.route ==
			'pages/goods/goods' || self.route == 'pages/groupGoods/groupGoods' || self.route == 'pages/pt/details/details' ||
			self.route == 'pages/miaosha/details/details' || self.route == 'pages/cart/cart' && !options.mch_id) {
			showGetLogin = false
		} else {
			showGetLogin = true
		}
		self.setData({
			resBaseUrl: getApp().envInfo.resBaseUrl,
			showGetLogin: showGetLogin
		})
		this.currentPage = self;
		this.currentPageOptions = options;
		var _this = this;
		if (options.share_vip_type) {
			getApp().core.setStorageSync('share_vip_type', options.share_vip_type)
		} else {
			getApp().core.setStorageSync('share_vip_type', 0)
		}
		if (options.mch_id) {
			_this.current_mchid = options.mch_id
		} else if (options.scene) {
			//console.log('打印options.scene')
			//console.log(options.scene)
			if (isNaN(options.scene)) {
				var scene = decodeURIComponent(options.scene);
				console.log(scene);
				if (scene) {
					scene = getApp().helper.scene_decode(scene);
					if (scene && scene.sid) {
						getApp().core.setStorageSync('s_id', scene.sid)
						this.getParentId()
					}
					if (scene && scene.mch_id) {
						_this.current_mchid = scene.mch_id
					} else if (getApp().mch_id) {
						_this.current_mchid = getApp().mch_id
					} else if (wx.getStorageSync('_mchInfo').id) {
						_this.current_mchid = wx.getStorageSync('_mchInfo').id
					} else {
						_this.current_mchid = getApp().mch_id
					}
				} else if (getApp().mch_id) {
					_this.current_mchid = getApp().mch_id
				} else if (wx.getStorageSync('_mchInfo').id) {
					_this.current_mchid = wx.getStorageSync('_mchInfo').id
				} else {
					_this.current_mchid = getApp().mch_id
				}
			} else if (getApp().mch_id) {
				_this.current_mchid = getApp().mch_id
			} else if (wx.getStorageSync('_mchInfo').id) {
				_this.current_mchid = wx.getStorageSync('_mchInfo').id
			} else {
				_this.current_mchid = getApp().mch_id
			}
		} else if (getApp().mch_id) {
			
			_this.current_mchid = getApp().mch_id
		} else if (wx.getStorageSync('_mchInfo').id) {
			_this.current_mchid = wx.getStorageSync('_mchInfo').id
		} else {
			_this.current_mchid = getApp().mch_id
		}
		// 邀请人id
		if (options.user_id) {
			if (options.user_id != getApp().promoter_id) {
				getApp().core.setStorageSync('promoter', {
					id: options.user_id
				});
				getApp().promoter_id = options.user_id
			}
		} else if (options.scene) {
			if (isNaN(options.scene)) {
				var scene = decodeURIComponent(options.scene);
				if (scene) {
					scene = getApp().helper.scene_decode(scene);
					if (scene && scene.user_id) {
						if (scene.user_id != getApp().promoter_id) {
							getApp().core.setStorageSync('promoter', {
								id: scene.user_id
							});
							getApp().promoter_id = scene.user_id
						}
					}
				}
			}
		}
		// 9.2 邀请人id
		if (options.user_id) {
			// if (options.user_id != getApp().core.getStorageSync('USER_INFO').id) {
			getApp().core.setStorageSync('u_id', options.user_id);
			getApp().core.setStorageSync('parent_id', options.user_id);
			// }
		} else if (getApp().user_id) {
			getApp().core.setStorageSync('u_id', getApp().user_id);
			getApp().core.setStorageSync('parent_id', options.user_id);
		}

		this.setMchInfo();

		//console.log('获取到了推荐人id')
		//console.log(getApp().promoter_id)
		this.setUserInfo();
		this.setWxappImg();
		this.setStore();
		this.setParentId(options);
		this.getNavigationBarColor();
		this.setDeviceInfo();
		this.setPageClasses();
		this.setPageNavbar();
		this.setBarTitle();
		// if (getApp().core.getStorageSync('s_id')) {
		// 	this.getParentId()
		// }

		if (typeof self.onSelfLoad === 'function') {
			self.onSelfLoad(options);
		}
		_this._setFormIdSubmit()
		if (typeof my !== 'undefined' && self.route != 'pages/login/login' && options) {
			if (!self.options)
				self['options'] = options;
			getApp().core.setStorageSync('last_page_options', options);
		};

		if (self.route == 'lottery/goods/goods' && options) {
			if (options.user_id) {
				var user_id = options.user_id;
				var lottery_id = options.id;

			} else if (options.scene) {
				if (isNaN(options.scene)) {
					let scene = decodeURIComponent(options.scene);
					if (scene) {
						scene = getApp().helper.scene_decode(scene);
						if (scene && scene.uid) {
							var user_id = scene.uid;
							var lottery_id = scene.gid;
						}
					}
				}
			};
			getApp().request({
				data: {
					user_id: user_id,
					lottery_id: lottery_id
				},
				url: getApp().api.lottery.clerk,
				success: function(res) {
					if (res.code == 0) {

					}
				}
			});
		}
		self.navigatorClick = function(e) {
			_this.navigatorClick(e, self);
		};
		// 设置平台标识
		self.setData({
			__platform: getApp().platform,
			_navigation_bar_color: getApp().core.getStorageSync(getApp().const.NAVIGATION_BAR_COLOR), //底部导航颜色
		});
		if (typeof self.showToast === 'undefined') {
			self.showToast = function(e) {
				_this.showToast(e);
			};
		}
		getApp().shareSendCoupon = function(self) {
			_this.shareSendCoupon(self);
		}
		if (typeof self.setTimeList === 'undefined') {
			self.setTimeList = function(e) {
				return _this.setTimeList(e);
			}
		}
		if (typeof self.showLoading === 'undefined') {
			self.showLoading = function(e) {
				_this.showLoading(e);
			}
		}
		if (typeof self.hideLoading === 'undefined') {
			self.hideLoading = function(e) {
				_this.hideLoading(e);
			}
		}
		if (typeof self.modalConfirm === 'undefined') {
			self.modalConfirm = function(e) {
				_this.modalConfirm(e);
			}
		}
		if (typeof self.modalClose === 'undefined') {
			self.modalClose = function(e) {
				_this.modalClose(e);
			}
		}
		if (typeof self.modalShow === 'undefined') {
			self.modalShow = function(e) {
				_this.modalShow(e);
			}
		}
		if (typeof self.myLogin === 'undefined') {
			self.myLogin = function() {
				_this.myLogin();
			}
		}
		if (typeof self.getUserInfo === 'undefined') {
			self.getUserInfo = function(res) {
				_this.getUserInfo(res);
			}
		}
		if (typeof self.getPhoneNumber === 'undefined') {
			self.getPhoneNumber = function(e) {
				_this.getPhoneNumber(e);
			}
		}
		if (typeof self.bindParent === 'undefined') {
			self.bindParent = function(e) {
				_this.bindParent(e);
			}
		}
		if (typeof self.closeCouponBox === 'undefined') {
			self.closeCouponBox = function(e) {
				_this.closeCouponBox(e);
			}
		}

		if (typeof self.relevanceSuccess === 'undefined') {
			self.relevanceSuccess = function(e) {
				_this.relevanceSuccess(e);
			}
		}

		if (typeof self.relevanceError === 'undefined') {
			self.relevanceError = function(e) {
				_this.relevanceError(e);
			}
		}
		if (typeof self.cancleLogin === 'undefined') {
			self.cancleLogin = function(e) {
				_this.cancleLogin(e);
			}
		}
		if (typeof self.getParentId === 'undefined') {
			self.getParentId = function(e) {
				_this.getParentId(e);
			}
		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function(self) {
		this.currentPage = self;
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function(self) {
		this.currentPage = self;
		getApp().orderPay.init(self, getApp());
		var quickNavigation = require('../components/quick-navigation/quick-navigation.js');
		quickNavigation.init(this.currentPage);
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function(self) {
		this.currentPage = self;
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function(self) {
		this.currentPage = self;
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function(self) {
		this.currentPage = self;
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function(self) {
		this.currentPage = self;
	},
	// 9.2 获取分享信息
	getParentId() {
		var self = this.currentPage;
		getApp().request({
			url: getApp().api.default.get_share_info,
			data: {
				sid: getApp().core.getStorageSync('s_id')
			},
			success: (res) => {
				if (res.code == 0) {
					if (res.data.user_id) {
						getApp().core.setStorageSync('parent_id', res.data.user_id)
						getApp().mch_id = res.data.mch_id;
					}
					if (res.data.rel_id) {
						getApp().core.setStorageSync('rel_id', res.data.rel_id)
						// self.setData({
						// 	scene_id: res.data.rel_id
						// })
						// console.log(self.data.scene_id);
					}
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			}
		})
	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function(self) {
		this.currentPage = self;
		let _this = this;
		setTimeout(function() {
			// 原转发赠送优惠券功能
			// getApp().shareSendCoupon(self);
			// 记录用户转发次数
			var role = getApp().core.getStorageSync('role')
			// 帮手分享
			if (role == 'seller') {
				_this.recordShare(self);
			}
		}, 1000);
	},
	onShareQp: function(self, paramStr, title, img) {
		var user_info = getApp().getUser();
		var mch_info = wx.getStorageSync('_mchInfo');
		var path = self.route + "?user_id=" + user_info.id + "&mch_id=" + (mch_info.id || '');
		if (paramStr) {
			path += "&" + paramStr;
		}
		var res = {
			path: path,
			title: title || mch_info.name
		};
		if (img) {
			res.imageUrl = img;
		}
		return res;
	},

	imageClick: function(e) {

	},

	textClick: function(e) {

	},

	tap1: function(e) {

	},

	tap2: function(e) {

	},

	formSubmit_collect: function(e) {
		let formId = e.detail.formId;

	},

	setUserInfo: function() {
		var self = this.currentPage;
		var userInfo = getApp().getUser();
		if (userInfo) {
			self.setData({
				__user_info: userInfo,
			});
		}
	},

	setWxappImg: function(e) {
		var self = this.currentPage;
		getApp().getConfig(function(config) {
			self.setData({
				__wxapp_img: config.wxapp_img,
				store: config.store,
			});
		});
	},

	setStore: function(e) {
		var self = this.currentPage;
		getApp().getConfig(function(config) {
			if (config.store) {
				self.setData({
					store: config.store,
					__is_comment: config.store ? config.store.is_comment : 1, //全局评价开关
					__is_sales: config.store ? config.store.is_sales : 1, //全局销量开关
					__is_member_price: config.store ? config.store.is_member_price : 1, //全局会员价开关
					__is_share_price: config.store ? config.store.is_share_price : 1, //全局分销价开关
					__alipay_mp_config: config.alipay_mp_config
				});
			}
		});
	},
	// 清楚缓存的店铺信息
	cleanMchInfo: function() {
		getApp().core.setStorageSync('_mchInfo', '');
	},
	setMchInfo: function($reloadCache) {
		$reloadCache = $reloadCache || false;
		var route = this.currentPage.route;
		if (route == 'pages/index/index' || route == 'pages/user/user') { // 特定页面要重新获取店铺信息（会存在各种从不同店铺切换的情况，所以要重新获取）
			$reloadCache = true;
		}
		var _this = this;
		var self = this.currentPage;
		let mch_id = this.current_mchid; // 注意在具体页面调的时候要先调page.onload方法，里面有赋值current_mchid
		// 没有传的时候也要继续，为了当前用户是店主身份的时候的处理
		// if (!mch_id || mch_id == '' || mch_id == 'undefined') {
		//     return false;
		// }
		// 每次重新获取，避免到不了其他店铺
		var cacheMch = getApp().core.getStorageSync('_mchInfo');
		if (!$reloadCache && cacheMch && cacheMch.id == mch_id && cacheMch.user_id) { // 已经存在当前店铺信息的
			return false;
		}

		getApp().core.setStorageSync('_mchInfo', {
			id: mch_id
		});
		getApp().request({
			url: getApp().api.default.merchants,
			success: function(res) {
				if (res.code == 0) {
					if (res.data.show_msg && res.data.show_msg != '') {
						getApp().core.showToast({
							title: res.data.show_msg
						});
					}
					if (res.data.mch) {
						getApp().core.setStorageSync('_mchInfo', res.data.mch);
						getApp().core.setStorageSync('_img', res.data.init_img);
						console.log(getApp().core.getStorageSync('_img'));
						getApp().core.setStorageSync('role', res.data.role || 'user');
						getApp().mch_id = res.data.mch.id;
						_this.currentPage && _this.currentPage.setData({
							'role': res.data.role || 'user'
						});
						if (route == 'pages/index/index') { // 获取首页的几张图片
							self.setData({
								first_order_img: getApp().core.getStorageSync('_img').bg_popup,
								congratulations_img: getApp().core.getStorageSync('_img').succ,
								sorry_img: getApp().core.getStorageSync('_img').sorry,
							})
						}
					} else {
						getApp().core.setStorageSync('_mchInfo', {
							id: mch_id
						});
						getApp().mch_id = mch_id
						getApp().core.setStorageSync('role', 'user');
					}
				} else {
					getApp().core.setStorageSync('_mchInfo', {
						id: mch_id
					});
					getApp().mch_id = mch_id
					getApp().core.setStorageSync('role', 'user');
				}
				getApp().trigger.run(getApp().trigger.events.set_mch);
			}
		});
	},
	viewStore: function() {
		getApp().request({
			url: getApp().api.default.jindian,
			data: {
				mch_id: getApp().mch_id,
				user_id: getApp().promoter_id
			},
			success: function(resb) {

			}
		});
	},
	setParentId: function(options) {
		var self = this.currentPage;
		var _this = this;
		if (self.route == '/pages/index/index') {
			_this.setOfficalAccount();
		}
		if (options) {
			var parent_id = 0;
			if (options.user_id) {
				parent_id = options.user_id;
			} else if (options.scene) {
				if (isNaN(options.scene)) {
					var scene = decodeURIComponent(options.scene);
					if (scene) {
						scene = getApp().helper.scene_decode(scene);
						if (scene && scene.uid) {
							parent_id = scene.uid;
						}
					}
				} else {
					if (self.route.indexOf('clerk') == -1) {
						parent_id = options.scene;
					}
				}
				_this.setOfficalAccount();
			} else if (getApp().query !== null) {
				var query = getApp().query;
				parent_id = query.uid;
			}
			if (parent_id) {
				getApp().core.setStorageSync(getApp().const.PARENT_ID, parent_id);
				getApp().trigger.remove(getApp().trigger.events.login, 'TRY_TO_BIND_PARENT');
				getApp().trigger.add(getApp().trigger.events.login, 'TRY_TO_BIND_PARENT', function() {
					self.bindParent({
						parent_id: parent_id,
						condition: 0
					})
				});
			}
		}
	},

	showToast: function(e) {
		var self = this.currentPage;
		var duration = e.duration || 2500;
		var title = e.title || '';
		var success = e.success || null;
		var fail = e.fail || null;
		var complete = e.complete || null;
		if (self._toast_timer) {
			clearTimeout(self._toast_timer);
		}
		self.setData({
			_toast: {
				title: title,
			},
		});
		self._toast_timer = setTimeout(function() {
			var _toast = self.data._toast;
			_toast.hide = true;
			self.setData({
				_toast: _toast,
			});
			if (typeof complete == 'function') {
				complete();
			}
		}, duration);
	},

	setDeviceInfo: function() {
		var self = this.currentPage;
		//iphonex=>iPhone X(GSM+CDMA)<iPhone10,3>
		var device_list = [{
				id: 'device_iphone_5',
				model: 'iPhone 5',
			},
			{
				id: 'device_iphone_x',
				model: 'iPhone X',
			},
			{
				id: 'device_iphone_x',
				model: 'iPhone 11',
			}
		];
		//设置设备信息
		var device_info = getApp().core.getSystemInfoSync();
		if (device_info.model) {
			if (device_info.model.indexOf('iPhone X') >= 0) {
				device_info.model = 'iPhone X';
			}
			if (device_info.model.indexOf('iPhone 11') >= 0) {
				device_info.model = 'iPhone 11';
			}
			for (var i in device_list) {
				if (device_list[i].model == device_info.model) {
					self.setData({
						__device: device_list[i].id,
					});
				}
			}
		}
	},

	setPageNavbar: function() {
		var _this = this;
		var self = this.currentPage;
		var navbar = getApp().core.getStorageSync('_navbar');
		if (self.route == 'pages/index/index' || self.route == 'pages/cart/cart' || self.route ==
			'pages/guanyiguan/guanyiguan' || self.route == 'pages/user/user' || self.route == 'pages/liveRoom/liveRoom') {
			if (navbar) {
				setNavbar(navbar);

			}

		} else {
			return
		}
		// if (navbar ) {
		// 	setNavbar(navbar);

		// }
		var in_array = false;
		if (self.route == 'pages/liveRoom/liveRoom') {
			setNavbar(navbar)
			in_array = true;
		}
		for (var i in _this.navbarPages) {
			if (self.route == _this.navbarPages[i]) {
				in_array = true;
				break;
			}
		}
		if (!in_array) {
			return;
		}
		getApp().request({
			url: getApp().api.default.navbar,
			success: function(res) {
				if (res.code == 0) {
					setNavbar(res.data);
					getApp().core.setStorageSync('_navbar', res.data);
					_this.setPageClasses();
				}
			}
		});

		function setNavbar(navbar) {
			var in_navs = false;
			for (var i in navbar.navs) {
				var url = navbar.navs[i].url;
				var route = self.route || (self.__route__ || null);
				if (navbar.navs[i].params) {
					url = navbar.navs[i].new_url;
					for (var key in self.options) {
						if (route.indexOf('?') == -1) {
							route += '?';
						} else {
							route += '&';
						}
						route += key + '=' + self.options[key];
					}
				}
				if (url === "/" + route) {
					navbar.navs[i].active = true;
					in_navs = true;
				} else {
					navbar.navs[i].active = false;
				}
				if ("/" + route === "/pages/liveRoom/liveRoom") {
					in_navs = true;
				}

			}
			if (!in_navs)
				return;
			self.setData({
				_navbar: navbar
			});
		}

	},

	setPageClasses: function() {
		var self = this.currentPage;
		var device = self.data.__device;
		var classes = device;
		if (self.data._navbar && self.data._navbar.navs && self.data._navbar.navs.length > 0) {
			classes += ' show_navbar';
		}
		if (classes) {
			self.setData({
				__page_classes: classes,
			});
		}
	},

	showLoading: function(e) {
		var self = self;
		self.setData({
			_loading: true
		});
	},

	hideLoading: function(e) {
		var self = this.currentPage;
		self.setData({
			_loading: false
		});
	},

	setTimeList: function(reset_time) {
		// 补零
		function fillZero(time) {
			if (time <= 0) {
				time = 0;
			}
			return time < 10 ? '0' + time : time;
		}

		var _s = '00';
		var _m = '00';
		var _h = '00';
		var _d = 0;
		if (reset_time >= 86400) {
			_d = parseInt(reset_time / 86400);
			reset_time = reset_time % 86400;
		}
		if (reset_time < 86400) {
			_h = parseInt(reset_time / 3600);
			reset_time = reset_time % 3600;
		}
		if (reset_time < 3600) {
			_m = parseInt(reset_time / 60);
			reset_time = reset_time % 60;
		}

		if (reset_time < 60) {
			_s = reset_time;
		}
		return {
			d: _d,
			h: fillZero(_h),
			m: fillZero(_m),
			s: fillZero(_s)
		}
	},

	setBarTitle: function(e) {
		var route = this.currentPage.route;
		var list = getApp().core.getStorageSync(getApp().const.WX_BAR_TITLE);
		for (var i in list) {
			if (list[i].url === route) {
				getApp().core.setNavigationBarTitle({
					title: list[i].title,
				})
			}
		}
	},

	getNavigationBarColor: function() {
		var app = getApp();
		var _this = this;
		var navigation_bar_color = getApp().core.getStorageSync(getApp().const.NAVIGATION_BAR_COLOR);
		if (navigation_bar_color) {
			getApp().core.setNavigationBarColor(navigation_bar_color);
			return
		}
		app.request({
			url: app.api.default.navigation_bar_color,
			success: function(res) {
				if (res.code == 0) {
					app.core.setStorageSync(getApp().const.NAVIGATION_BAR_COLOR, res.data);
					_this.setNavigationBarColor();
					if (app.navigateBarColorCall && typeof app.navigateBarColorCall == 'function') {
						app.navigateBarColorCall(res);
					}
				}
			}
		});
	},

	setNavigationBarColor: function() {
		var navigation_bar_color = getApp().core.getStorageSync(getApp().const.NAVIGATION_BAR_COLOR);
		if (navigation_bar_color) {
			getApp().core.setNavigationBarColor(navigation_bar_color);
		}
		getApp().navigateBarColorCall = function(res) {
			getApp().core.setNavigationBarColor(res.data);
		}
	},

	navigatorClick: function(e, self) {
		var open_type = e.currentTarget.dataset.open_type;
		if (open_type == 'redirect') {
			return true;
		}
		if (open_type == 'wxapp') {
			return;
		}
		if (open_type == 'tel') {
			var contact_tel = e.currentTarget.dataset.tel;
			getApp().core.makePhoneCall({
				phoneNumber: contact_tel
			})
		}
		return false;

		function parseQueryString(url) {
			var reg_url = /^[^\?]+\?([\w\W]+)$/,
				reg_para = /([^&=]+)=([\w\W]*?)(&|$|#)/g,
				arr_url = reg_url.exec(url),
				ret = {};
			if (arr_url && arr_url[1]) {
				var str_para = arr_url[1],
					result;
				while ((result = reg_para.exec(str_para)) != null) {
					ret[result[1]] = result[2];
				}
			}
			return ret;
		}
	},
	// 记录分享次数
	recordShare: function(self) {
		//console.log('调用记录')
		var app = getApp();
		app.request({
			url: app.api.default.record_share,
			success: function(res) {
				if (res.code == 0) {
					console.log('成功')
				}
			}
		});
	},
	/**
	 * 分享送优惠券
	 */
	shareSendCoupon: function(self) {
		var app = getApp();
		app.core.showLoading({
			mask: true,
		});
		if (!self.hideGetCoupon) {
			self.hideGetCoupon = function(e) {
				var url = e.currentTarget.dataset.url || false;
				self.setData({
					get_coupon_list: null,
				});
				if (url) {
					app.core.navigateTo({
						url: url,
					});
				}
			};
		}
		app.request({
			url: app.api.coupon.share_send,
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						get_coupon_list: res.data.list
					});
				}
			},
			complete: function() {
				app.core.hideLoading();
			}
		});
	},

	/**
	 * 绑定上下级关系
	 */
	bindParent: function(object) {
		var app = getApp();
		if (object.parent_id == "undefined" || object.parent_id == 0)
			return;
		var user_info = app.getUser();
		var share_setting = app.core.getStorageSync(app.const.SHARE_SETTING);
		if (share_setting.level > 0) {
			var parent_id = object.parent_id;
			if (parent_id != 0) {
				app.request({
					url: app.api.share.bind_parent,
					data: {
						parent_id: object.parent_id,
						condition: object.condition
					},
					success: function(res) {
						if (res.code == 0) {
							user_info.parent = res.data
							app.setUser(user_info);
						}
					}
				});
			}
		}
	},

	_setFormIdSubmit: function(e) {
		let self = this.currentPage;
		if (self._formIdSubmit) {
			return;
		}
		self._formIdSubmit = function(e) {
			let dataset = e.currentTarget.dataset;
			let form_id = e.detail.formId;
			let bind = dataset.bind || null;
			let type = dataset.type || null;
			let url = dataset.url || null;

			// 保存formId
			{
				let form_id_list = getApp().core.getStorageSync(getApp().const.FORM_ID_LIST);
				if (!form_id_list || !form_id_list.length) {
					form_id_list = [];
				}

				var oldFormId = [];
				for (var wf in form_id_list) {
					oldFormId.push(form_id_list[wf]['form_id']);
				}

				//重复的formId不添加
				if ('the formId is a mock one' !== form_id && !getApp().helper.inArray(form_id, oldFormId)) {
					form_id_list.push({
						time: getApp().helper.time(),
						form_id: form_id,
					});

					getApp().core.setStorageSync(getApp().const.FORM_ID_LIST, form_id_list);
				}
			}

			// 调用自定义事件function
			if (self[bind] && typeof self[bind] === 'function') {
				self[bind](e);
			}

			// 页面跳转
			switch (type) {
				case 'navigate':
					if (url)
						getApp().core.navigateTo({
							url: url,
						});
					break;
				case 'redirect':
					if (url)
						getApp().core.redirectTo({
							url: url,
						});
					break;
				case 'switchTab':
					if (url)
						getApp().core.switchTab({
							url: url,
						});
					break;
				case 'reLaunch':
					if (url)
						getApp().core.reLaunch({
							url: url,
						});
					break;
				case 'navigateBack':
					if (url)
						getApp().core.navigateBack({
							url: url,
						});
					break;
				default:
					break;
			}
		};

	},

	modalClose: function(e) {
		var self = this.currentPage;
		self.setData({
			modal_show: false
		});

	},

	modalConfirm: function(e) {
		var self = this.currentPage;
		self.setData({
			modal_show: false
		});

	},

	modalShow: function(e) {
		var self = this.currentPage;
		self.setData({
			modal_show: true
		});

	},


	getUserInfo: function(res) {
		var _this = this;
		if (res.detail.errMsg != 'getUserInfo:ok') {
			return;
		}
		getApp().core.login({
			success: function(login_res) {
				var code = login_res.code;
				_this.unionLogin({
					code: code,
					user_info: res.detail.rawData,
					encrypted_data: res.detail.encryptedData,
					iv: res.detail.iv,
					signature: res.detail.signature
				});
			},
			fail: function(res) {},
		});

	},

	//支付宝小程序登录
	myLogin: function() {
		console.log(111);
		var _this = this;
		if (getApp().platform !== 'my')
			return;

		if (getApp().login_complete) {
			return;
		}
		getApp().login_complete = true;
		my.getAuthCode({
			scopes: 'auth_user',
			success: function(res) {
				_this.unionLogin({
					code: res.authCode
				});
			},
			fail: function(res) {
				getApp().login_complete = false;
				getApp().core.redirectTo({
					url: '/pages/index/index'
				});
			}
		});
	},

	unionLogin: function(data) {
		//console.log('page.js login');
		var self = this.currentPage;
		var _this = this;
		getApp().core.showLoading({
			title: "正在登录",
			mask: true,
		});
		getApp().request({
			url: getApp().api.passport.login,
			method: 'POST',
			data: data,
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						__user_info: res.data
					});
					getApp().setUser(res.data);
					getApp().core.setStorageSync(getApp().const.ACCESS_TOKEN, res.data.access_token);
					getApp().trigger.run(getApp().trigger.events.login);
					_this.setMchInfo(true);

					var store = getApp().core.getStorageSync(getApp().const.STORE);
					if (res.data.binding || (!store.option || !store.option.phone_auth) || (store.option.phone_auth && store.option
							.phone_auth == 0)) {
						_this.loadRoute();
					} else {
						if (typeof wx === 'undefined') {
							_this.loadRoute();
						}
						_this.setPhone();
					}
					_this.setUserInfoShowFalse();
				} else {
					getApp().login_complete = false;
					getApp().core.showModal({
						title: '提示',
						content: res.msg,
						showCancel: false,
					});
				}
			},
			complete: function() {
				getApp().core.hideLoading();
			}
		});
	},


	getPhoneNumber: function(e) {
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
			getApp().core.login({
				success: function(res) {
					if (res.code) {
						var code = res.code;
						getApp().request({
							url: getApp().api.user.user_binding,
							method: 'POST',
							data: {
								iv: e.detail.iv,
								encryptedData: e.detail.encryptedData,
								code: code,
							},
							success: function(res) {
								if (res.code == 0) {
									var user_info = self.data.__user_info;
									user_info.binding = res.data.dataObj;

									getApp().setUser(user_info);

									self.setData({
										PhoneNumber: res.data.dataObj,
										__user_info: user_info,
										binding: true,
										binding_num: res.data.dataObj
									});
									_this.loadRoute();
								} else {
									getApp().core.showToast({
										title: '授权失败,请重试'
									});
								}
							},
							complete: function(res) {
								getApp().core.hideLoading();
							}
						});
					} else {
						getApp().core.showToast({
							title: '获取用户登录态失败！' + res.errMsg,
						});
					}
				},
			});
		}
	},
	setUserInfoShow: function() {
		var self = this.currentPage;
		if (getApp().platform == 'wx') {
			self.setData({
				user_info_show: true
			});
		} else {
			this.myLogin();
		}
	},
	cancleLogin: function() {
		var _this = this;
		_this.setUserInfoShowFalse();
	},
	setPhone: function() {
		var self = this.currentPage;
		if (typeof my === 'undefined') {
			self.setData({
				user_bind_show: true
			});
		}
	},
	setUserInfoShowFalse: function() {
		var self = this.currentPage;
		self.setData({
			user_info_show: false,
			showGetLogin: false
		});
	},

	closeCouponBox: function(e) {
		var self = this.currentPage;
		self.setData({
			get_coupon_list: ""
		});
	},

	// 关联公众号组件加载成功
	relevanceSuccess: function(e) {

	},

	// 关联公众号组件加载失败
	relevanceError: function(e) {

	},

	setOfficalAccount: function(e) {
		var self = this.currentPage;
		self.setData({
			__is_offical_account: true
		});
	},
	loadRoute: function() {
		var self = this.currentPage;
		var _this = this;
		getApp().core.redirectTo({
			url: '/' + self.route + '?' + getApp().helper.objectToUrlParams(self.options),
		});
		// if (self.route == 'pages/index/index') {} else {
		//     getApp().core.redirectTo({
		//         url: '/' + self.route + '?' + getApp().helper.objectToUrlParams(self.options),
		//     });
		// }
		_this.setUserInfoShowFalse();
	},
	// 根据sid从服务端获取 分享信息
	getServerShareInfo: function(options, callback) {
		var self = this.currentPage;
		getApp().core.request({
			url: getApp().api.default.get_share_info,
			data: {
				sid: options.sid
			},
			success: function(res) {
				res = res.data;
				if (res.code == 0) {
					options.mch_id = res.data.mch_id
					options.abc = {
						parent_id: res.data.user_id,
						store_id: res.data.store_id,
						store_group_id: res.data.store_group_id,
						mch_id: res.data.mch_id
					};
					self.setData({
						parent_id: res.data.user_id,
						store_id: res.data.store_id,
						store_group_id: res.data.store_group_id,
					})
					callback(options);
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			}
		})
	}
};
