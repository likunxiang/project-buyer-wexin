var utils = require('../../../utils/helper.js');
var WxParse = require('../../../wxParse/wxParse.js');
var goodsBanner = require('../../../components/goods/goods_banner.js');
var gSpecificationsModel = require('../../../components/goods/specifications_model.js'); //商城多规格选择
var goodsInfo = require('../../../components/goods/goods_info.js');
var goodsBuy = require('../../../components/goods/goods_buy.js');
import util from '../../../utils/util.js'
var p = 1;
var is_loading_comment = false;
var is_more_comment = true;
var share_count = 0;
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		haveBuy: '0%', //已抢百分比
		futureText: '', //活动即将开始文案
		pageType: "MIAOSHA",
		id: null,
		goods: {},
		show_attr_picker: false,
		form: {
			number: 1,
		},
		tab_detail: "active",
		tab_comment: "",
		comment_list: [],
		comment_count: {
			score_all: 0,
			score_3: 0,
			score_2: 0,
			score_1: 0,
		},
		autoplay: false,
		hide: "hide",
		show: false,
		x: getApp().core.getSystemInfoSync().windowWidth,
		y: getApp().core.getSystemInfoSync().windowHeight - 20,
		miaosha_end_time_over: {
			h: "--",
			m: "--",
			s: "--",
			type: 0
		},
		lestNum: 0,
		role: getApp().core.getStorageSync('role'),
		active2: 0,
		is_commission: true,
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		getApp().page.onLoad(this, options);
		var self = this;
		wx.hideShareMenu()
		share_count = 0;
		p = 1;
		is_loading_comment = false;
		is_more_comment = true;
		// var parent_id = 0;
		// var user_id = options.user_id;
		// var scene = decodeURIComponent(options.scene);
		// var scene_type = 0;
		// if (typeof user_id !== 'undefined') {
		//     parent_id = user_id;
		// } else {
		//     if (typeof my === 'undefined') {
		//         if (typeof options.scene !== 'undefined') {
		//             scene_type = 1;
		//             var scene = decodeURIComponent(options.scene);
		//             var scene_obj = utils.scene_decode(scene);
		//             if (scene_obj.gid) {
		//                 //parent_id = scene_obj.user_id;
		//                 options.id = scene_obj.gid;
		//             } else {
		//                 parent_id = scene;
		//             }
		//         }
		//     } else {
		//         if (getApp().query !== null) {
		//             scene_type = 1;
		//             var query = getApp().query;
		//             getApp().query = null;
		//             options.id = query.gid;
		//         }
		//     }
		// }
		if (getApp().core.getStorageSync('rel_id') && options.scene) {
			options.id = getApp().core.getStorageSync('rel_id')
		}
		if (options.scene && getApp().core.getStorageSync('s_id')) {
			getApp().request({
				url: getApp().api.default.get_share_info,
				data: {
					sid: getApp().core.getStorageSync('s_id')
				},
				success: (res) => {
					if (res.code == 0) {
						if (res.data.rel_id) {
							options.id = res.data.rel_id
							self.setData({
								id: options.id,
								gsId: options.id,
								// scene_type: scene_type,
								role: getApp().core.getStorageSync('role')
							});
						}
						goodsBanner.init(this);
						gSpecificationsModel.init(this);
						goodsInfo.init(this);
						goodsBuy.init(this);
						this.goodsOnLoad()
						this.checkFirstOrder()
						self.getGoods();
					} else {
						wx.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				}
			})
		} else {
			self.setData({
				id: options.id,
				gsId: options.id,
				// scene_type: scene_type,
				role: getApp().core.getStorageSync('role')
			});
			goodsBanner.init(this);
			gSpecificationsModel.init(this);
			goodsInfo.init(this);
			goodsBuy.init(this);
			this.goodsOnLoad()
			this.checkFirstOrder()
			self.getGoods();
		}
		var pages = getCurrentPages();
		var prevPage = pages.length < 2 ? false : true;
		if (prevPage) {
			self.setData({
				isReturn: true
			})
		}
		self.setData({
			nickName: getApp().core.getStorageSync('USER_INFO').nickname,
			avatarUrl: getApp().core.getStorageSync('USER_INFO').avatar_url,
			userId: getApp().core.getStorageSync('USER_INFO').id,
			mchId: getApp().core.getStorageSync('_mchInfo').id,
			storeId: getApp().core.getStorageSync('STORE').id,
			type: 2,
		});

	},
	getGoodsAttr: function() {
		var self = this
		getApp().request({
			url: getApp().api.default.goods_attr,
			data: {
				id: self.data.id,
				from: 2,
				address_id: self.data.address_id || '',
			},
			success: function(res) {
				if (res.code == 0) {
					let lestNum = 0;
					if (res.data.attr) {
						for (let i in res.data.attr) {
							lestNum = lestNum + res.data.attr[i].num
						}
					}
					self.selectDefaultAttr(res.data);
					self.getJDSend()
					self.setData({
						goods_attr: res.data.attr,
						attr_group_list: res.data.attr_group_list,
						lestNum: lestNum
					})

				}
			}
		})
	},
	getGoods: function() {
		var self = this;
		var data = {};
		data.from = 2
		if (self.data.id) {
			data.id = self.data.id;
		}
		if (self.data.goods_id) {
			data.goods_id = self.datat.goods_id
		}
		// data.scene_type = self.data.scene_type;
		getApp().request({
			url: getApp().api.default.goods,
			data: data,
			success: function(res) {
				if (res.code == 0) {
					var detail = res.data.detail;
					WxParse.wxParse("detail", "html", detail, self);

					var goods = res.data;
					if (res.data.live_id) {
						var mch_id = wx.getStorageSync('_mchInfo').id;
						var user_id = getApp().core.getStorageSync('USER_INFO').id
						let roomId = res.data.live_id // 填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
						let customParams = encodeURIComponent(JSON.stringify({
							sid: this.data.sid,
							mch_id: mch_id,
							user_id: user_id
						})) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
						let live_room_status_desc = res.data.live_status_str
						let liveStatus = res.data.live_status
						self.setData({
							roomId,
							customParams,
							liveStatus,
							live_room_status_desc
						})
					}
					self.setData({
						goods: goods,
					});
					self.getGoodsAttr()
					self.getCommentList()
					self.getAllLook()
					self.setMiaoshaTimeOver();
					self.getSameTuijian()
					self.getLook()
				}
				if (res.code == 1) {
					getApp().core.showModal({
						title: "提示",
						content: res.msg,
						showCancel: false,
						success: function(res) {
							if (res.confirm) {
								wx.navigateBack({
									delta: 1
								})
							}
						}
					});
				}
			}
		});
	},



	addCart: util.throttle(function() {
		var token = getApp().core.getStorageSync('ACCESS_TOKEN')
		if (!token) {
			this.setData({
				showGetLogin: true,
				user_info_show: true,
			})
			return
		}
		this.submit('ADD_CART');
	}, 1000),

	buyNow: util.throttle(function() {
		// if (!this.data.goods.miaosha) {
		//     getApp().core.showModal({
		//         title: "提示",
		//         content: '秒杀商品当前时间暂无活动',
		//         showCancel: false,
		//         success: function(res) {}
		//     });
		//     return;
		// }
		var token = getApp().core.getStorageSync('ACCESS_TOKEN')
		if (!token) {
			this.setData({
				showGetLogin: true,
				user_info_show: true,
			})
			return
		}
		this.submit('BUY_NOW');
	}, 1000),

	submit: function(type) {
		var self = this;
		if (!self.data.show_attr_picker) {
			self.setData({
				show_attr_picker: true,
			});
			return true;
		}
		if (self.data.goods && self.data.goods.num > 0 && self.data.form.number > self.data.goods.num) {
			getApp().core.showToast({
				title: "商品库存不足，请选择其它规格或数量",
				icon: 'none'
			});
			return true;
		}
		if (this.data.goods.start_time > Date.parse(new Date())) {
			getApp().core.showToast({
				title: "活动未开始",
				icon: 'none'
			});
			return true;
		}

		if (self.data.form.number > self.data.goods.num) {
			getApp().core.showToast({
				title: "商品库存不足，请选择其它规格或数量",
				icon: 'none'
			});
			return true;
		}
		if (type == 'ADD_CART') { //加入购物车
		}
		if (type == 'BUY_NOW') { //立即购买
			self.setData({
				show_attr_picker: false,
			});

			var goods_list = [];
			goods_list.push({
				goods_id: self.data.id,
				num: self.data.form.number,
				sku: self.data.goods.sku,
				from: 2
			});
			var goods = self.data.goods;
			var mch_id = 0;
			if (goods.mch != null) {
				mch_id = goods.mch.id
			}
			var mch_list = [];
			mch_list.push({
				mch_id: mch_id,
				goods_list: goods_list
			});
			getApp().core.navigateTo({
				url: "/pages/new-order-submit/new-order-submit?mch_list=" + JSON.stringify(mch_list),
			});
		}

	},

	favoriteAdd: function() {
		var self = this;
		getApp().request({
			url: getApp().api.user.favorite_add,
			method: "post",
			data: {
				goods_id: self.data.goods.id,
			},
			success: function(res) {
				if (res.code == 0) {
					var goods = self.data.goods;
					goods.is_favorite = 1;
					self.setData({
						goods: goods,
					});
				}
			}
		});
	},

	favoriteRemove: function() {
		var self = this;
		getApp().request({
			url: getApp().api.user.favorite_remove,
			method: "post",
			data: {
				goods_id: self.data.goods.id,
			},
			success: function(res) {
				if (res.code == 0) {
					var goods = self.data.goods;
					goods.is_favorite = 0;
					self.setData({
						goods: goods,
					});
				}
			}
		});
	},

	tabSwitch: function(e) {
		var self = this;
		var tab = e.currentTarget.dataset.tab;
		if (tab == "detail") {
			self.setData({
				tab_detail: "active",
				tab_comment: "",
			});
		} else {
			self.setData({
				tab_detail: "",
				tab_comment: "active",
			});
		}
	},
	commentPicView: function(e) {
		var self = this;
		var index = e.currentTarget.dataset.index;
		var pic_index = e.currentTarget.dataset.picIndex;
		getApp().core.previewImage({
			current: self.data.comment_list[index].pic_list[pic_index],
			urls: self.data.comment_list[index].pic_list,
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function(options) {
		getApp().page.onReady(this);
	},
	getCommentList: function() {
		var self = this;
		getApp().request({
			url: getApp().api.default.walk_goods_list,
			data: {
				brand_id: self.data.goods.brand_id,
			},
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						linkGoods: res.data.list
					})
				}
			},
			complete: function() {
				getApp().core.stopPullDownRefresh();
			}

		})
	},
	getAllLook() {
		var self = this
		getApp().request({
			url: getApp().api.default.walk_goods_rec,
			data: {
				position: 1 // 1->商品详情页推荐， 2->购物车推荐， 3->品牌主页推荐
			},
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						allLookList: res.data.list
					})
				}
			},
			complete: function() {
				getApp().core.stopPullDownRefresh();
			}
		})
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function(options) {
		getApp().page.onShow(this);
		var self = this;
		var address_id = 0;
		var address = getApp().core.getStorageSync(getApp().const.PICKER_ADDRESS);
		if (address) {
			self.setData({
				address_id: address.id
			});
		}
		if (self.data.goods && (self.data.goods.supplier_role == 1 || self.data.goods.supplier_role == 2)) {
			self.getJDSend()
		}
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function(options) {
		getApp().page.onHide(this);

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function(options) {
		getApp().page.onUnload(this);

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function(options) {
		getApp().page.onPullDownRefresh(this);

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function(options) {
		getApp().page.onReachBottom(this);
		var self = this;
		self.getCommentList(true);
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function(res) {
		var self = this;
		var user_info = getApp().core.getStorageSync(getApp().const.USER_INFO);
		var mch_info = wx.getStorageSync('_mchInfo');
		switch (res.from) {
			case 'button':
				var res = {
					path: "/pages/miaosha/details/details?id=" + this.data.id + "&user_id=" + user_info.id + "&mch_id=" + mch_info
						.id,
					title: self.data.goods.name,
					imageUrl: self.data.sharePic,
				};
				break;
			case 'menu':
				var res = {
					path: "/pages/miaosha/details/details?id=" + this.data.id + "&user_id=" + user_info.id + "&mch_id=" + mch_info
						.id,
					title: self.data.goods.name,
					imageUrl: self.data.goods.first_cover_pic,
				}
				break;
			default:
				break;
		}
		self.shareModalClose()
		return res;
	},
	play: function(e) {
		var url = e.target.dataset.url; //获取视频链接
		this.setData({
			url: url,
			hide: '',
			show: true,
		});
		var videoContext = getApp().core.createVideoContext('video');
		videoContext.play();
	},

	close: function(e) {
		if (e.target.id == 'video') {
			return true;
		}
		this.setData({
			hide: "hide",
			show: false
		});
		var videoContext = getApp().core.createVideoContext('video');
		videoContext.pause();
	},

	hide: function(e) {
		if (e.detail.current == 0) {
			this.setData({
				img_hide: ""
			});
		} else {
			this.setData({
				img_hide: "hide"
			});
		}
	},

	closeCouponBox: function(e) {
		this.setData({
			get_coupon_list: ""
		});
	},

	setMiaoshaTimeOver: function() {
		var self = this;

		function _init() {
			var time_over = self.data.goods.start_time - self.data.goods.now_time;
			if (time_over >= 0) {
				self.data.goods.is_start = 0;
			} else {
				self.data.goods.is_start = 1;
				time_over = self.data.goods.end_time - self.data.goods.now_time;
			}
			time_over = time_over < 0 ? 0 : time_over;
			self.data.goods.now_time++;
			self.setData({
				goods: self.data.goods,
				miaosha_end_time_over: secondToTime(time_over),
			});
		}

		_init();
		setInterval(function() {
			_init();
		}, 1000);

		function secondToTime(second) {
			var _h = parseInt(second / 3600);
			var _m = parseInt((second % 3600) / 60);
			var _s = second % 60;
			var type = 0;
			if (_h >= 1) {
				// 小时大于1则减至1
				// _h -= 1,
				type = 1
			}
			return {
				h: _h < 10 ? ("0" + _h) : ("" + _h),
				m: _m < 10 ? ("0" + _m) : ("" + _m),
				s: _s < 10 ? ("0" + _s) : ("" + _s),
				type: type
			};
		}

	},
	to_dial: function(e) {
		var contact_tel = this.data.store.contact_tel;
		getApp().core.makePhoneCall({
			phoneNumber: contact_tel
		})
	},

});
