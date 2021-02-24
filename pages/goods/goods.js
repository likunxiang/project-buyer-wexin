var WxParse = require('../../wxParse/wxParse.js');
var shoppingCart = require('../../components/shopping_cart/shopping_cart.js');
var specificationsModel = require('../../components/specifications_model/specifications_model.js'); //快速购买多规格
var gSpecificationsModel = require('../../components/goods/specifications_model.js'); //商城多规格选择
var goodsBanner = require('../../components/goods/goods_banner.js');
var goodsInfo = require('../../components/goods/goods_info.js');
var goodsBuy = require('../../components/goods/goods_buy.js');
var goodsRecommend = require('../../components/goods/goods_recommend.js');
var p = 1;
var is_loading_comment = false;
var is_more_comment = true;
var share_count = 0;
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		pageType: 'STORE', //模块页面标识
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
		page: 1,
		drop: false,
		goodsModel: false,
		goods_num: 0,
		temporaryGood: {
			price: 0.00, // 对应规格的价格
			num: 0,
			use_attr: 1
		},
		goodNumCount: 0,
		isParameter: false,
		role: getApp().core.getStorageSync('role'),
		active2: 2,
		is_scroll: true,
		is_commission: true,
		spendList: ['icon-shixinwujiaoxing', 'icon-shixinwujiaoxing', 'icon-shixinwujiaoxing', 'icon-shixinwujiaoxing',
			'icon-shixinwujiaoxing'
		],
		is_show_modal: true, // 首单会员
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom,
		pageUrl: 'goods'
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		getApp().page.onLoad(this, options);
		this.setData({
			nickName: getApp().core.getStorageSync('USER_INFO').nickname,
			avatarUrl: getApp().core.getStorageSync('USER_INFO').avatar_url,
			userId: getApp().core.getStorageSync('USER_INFO').id,
			mchId: getApp().core.getStorageSync('_mchInfo').id,
			storeId: getApp().core.getStorageSync('STORE').id,
			gsId: options.id,
			type: 2, //我的页面进入
			header_bg: getApp().core.getStorageSync('_mchInfo').header_bg,
		})
		var self = this;
		share_count = 0;
		p = 1;
		is_loading_comment = false;
		is_more_comment = true;
		// if (typeof my === 'undefined') {
		// 	var scene = decodeURIComponent(options.scene);
		// 	if (typeof scene !== 'undefined') {
		// 		var scene_obj = getApp().helper.scene_decode(scene);
		// 		if (scene_obj.gid) {
		// 			options.id = scene_obj.gid;
		// 		}
		// 	}
		// } else {
		// 	if (getApp().query !== null) {
		// 		var query = app.query;
		// 		getApp().query = null;
		// 		options.id = query.gid;
		// 	}
		// }
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
								from: options.from || 1,
								role: getApp().core.getStorageSync('role')
							});
						} else {
							self.setData({
								id: options.id,
								from: options.from || 1,
								role: getApp().core.getStorageSync('role')
							});
						}
						shoppingCart.init(this);
						specificationsModel.init(this, shoppingCart);
						gSpecificationsModel.init(this);
						goodsBanner.init(this);
						goodsInfo.init(this);
						goodsBuy.init(this);
						this.goodsOnLoad()
						goodsRecommend.init(this);
						this.checkFirstOrder()
						this.getGoods();
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
				from: options.from || 1,
				role: getApp().core.getStorageSync('role')
			});
			shoppingCart.init(this);
			specificationsModel.init(this, shoppingCart);
			gSpecificationsModel.init(this);
			goodsBanner.init(this);
			goodsInfo.init(this);
			goodsBuy.init(this);
			this.goodsOnLoad()
			goodsRecommend.init(this);
			this.checkFirstOrder()
			this.getGoods();
		}


		var pages = getCurrentPages();
		var prevPage = pages.length < 2 ? false : true;
		if (prevPage) {
			self.setData({
				isReturn: true
			})
		}
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {
		getApp().page.onReady(this);
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
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
	onHide: function() {
		getApp().page.onHide(this);
		shoppingCart.saveItemData(this);
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {
		getApp().page.onUnload(this);
		shoppingCart.saveItemData(this);
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {
		getApp().page.onPullDownRefresh(this);

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {
		getApp().page.onReachBottom(this);
		var self = this;
		if (self.data.tab_detail == 'active' && self.data.drop) {
			self.data.drop = false;
			self.goods_recommend({
				'goods_id': self.data.goods.id,
				'loadmore': true
			});

		} else if (self.data.tab_comment == 'active') {
			self.getCommentList(true);
		}

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function(res) {
		var self = this;
		var user_info = getApp().getUser();
		var mch_info = wx.getStorageSync('_mchInfo');
		switch (res.from) {
			case 'button':
				var res = {
					path: "/pages/goods/goods?id=" + this.data.id + "&from=" + this.data.from + "&user_id=" + user_info.id +
						"&mch_id=" + mch_info.id,
					title: self.data.goods.name,
					imageUrl: self.data.sharePic,
				};
				break;
			case 'menu':
				var res = {
					path: "/pages/goods/goods?id=" + this.data.id + "&from=" + this.data.from + "&user_id=" + user_info.id +
						"&mch_id=" + mch_info.id,
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

	closeCouponBox: function(e) {
		this.setData({
			get_coupon_list: ""
		});
	},

	to_dial: function(e) {
		var contact_tel = this.data.store.contact_tel;
		getApp().core.makePhoneCall({
			phoneNumber: contact_tel
		})
	},
	getGoods: function() {
		var self = this;
		getApp().request({
			url: getApp().api.default.goods,
			data: {
				id: self.data.id,
				from: self.data.from || 1
			},
			success: function(res) {
				if (res.code == 0) {
					var detail = res.data.detail;
					WxParse.wxParse("detail", "html", detail, self);
					var goods = res.data;
					goods.attr_pic = res.data.attr_pic;
					goods.linkGoods = res.data.link_goods;
					goods.c1 = res.data.commission_price;
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
						// goods_attr:res.data.attr,
						// attr_group_list: res.data.attr_group_list,
						btn: true
					});
					self.getGoodsLink()
					self.getCommentList();
					self.getAllLook()
					self.getGoodsAttr()
					self.goods_recommend({
						'goods_id': res.data.id,
						'reload': true,
					});
					// 满减优惠
					if (res.data.youhui && res.data.youhui.length != 0) {
						self.setData({
							preferential: true //满减优惠开关
						});
					}
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
	getGoodsAttr: function() {
		var self = this
		getApp().request({
			url: getApp().api.default.goods_attr,
			data: {
				id: self.data.id,
				from: self.data.from || 1,
				address_id: self.data.address_id || '',
			},
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						goods_attr: res.data.attr,
						attr_group_list: res.data.attr_group_list,
						min_str: res.data.min_str
					});
					if (res.data.attr != null && res.data.attr_group_list != null) {
						self.selectDefaultAttr(res.data);
						self.getJDSend()
					}

				}

			}
		})
	},
	getGoodsLink: function() {
		var self = this
		getApp().request({
			url: getApp().api.default.goods_link,
			data: {
				brand_id: self.data.goods.brand_id,
				from: self.data.from || 1
			},
			success: function(res) {
				if (res.code == 0) {
					var arr = [
						[],
						[],
						[]
					]
					var j = 0
					for (let i in res.data) {
						arr[j].push(res.data[i])
						if (arr[j].length >= 6 * (j + 1)) {
							j++
						}
					}
					var index = 2
					self.setData({
						sameList: arr
					})
				}
			}
		})
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

});
