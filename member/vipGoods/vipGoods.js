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
			type: 2 //我的页面进入
		})
		var self = this;
		share_count = 0;
		p = 1;
		is_loading_comment = false;
		is_more_comment = true;
		var quick = options.quick;
		if (quick) {
			var item = getApp().core.getStorageSync(getApp().const.ITEM);
			if (item) {
				var total = item.total;
				var carGoods = item.carGoods;
			} else {
				var total = {
					total_price: 0.00,
					total_num: 0
				}
				var carGoods = [];
			}
			self.setData({
				quick: quick,
				quick_list: item.quick_list,
				total: total,
				carGoods: carGoods,
				quick_hot_goods_lists: item.quick_hot_goods_lists,
			});
		}
		if (typeof my === 'undefined') {
			var scene = decodeURIComponent(options.scene);
			if (typeof scene !== 'undefined') {
				var scene_obj = getApp().helper.scene_decode(scene);
				if (scene_obj.gid) {
					options.id = scene_obj.gid;
				}
			}
		} else {
			if (getApp().query !== null) {
				var query = app.query;
				getApp().query = null;
				options.id = query.gid;
			}
		}

		self.setData({
			id: 1572506, // options.id,
			role: getApp().core.getStorageSync('role')
		});
		self.getGoods();
		var pages = getCurrentPages();
		var prevPage = pages.length < 2 ? false : true;
		if (prevPage) {
			self.setData({
				isReturn: true
			})
		}

	},
	openParameter: function() {
		this.setData({
			isParameter: true
		})
	},
	closeParameter: function() {
		this.setData({
			isParameter: false
		})
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
		shoppingCart.init(this);
		specificationsModel.init(this, shoppingCart);
		gSpecificationsModel.init(this);
		goodsBanner.init(this);
		goodsInfo.init(this);
		goodsBuy.init(this);
		goodsRecommend.init(this);

		var self = this;
		var item = getApp().core.getStorageSync(getApp().const.ITEM);
		if (item) {
			var total = item.total;
			var carGoods = item.carGoods;
			var goods_num = self.data.goods_num;
		} else {
			var total = {
				total_price: 0.00,
				total_num: 0
			}
			var carGoods = [];
			var goods_num = 0;
		}
		self.setData({
			total: total,
			carGoods: carGoods,
			goods_num: goods_num
		});
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
					path: "/member/vipGoods/vipGoods?id=" + this.data.id + "&user_id=" + user_info.id + "&mch_id=" + mch_info.id,
					title: self.data.goods.brand.name + ' | ' + self.data.goods.name,
					imageUrl: self.data.sharePic,
				};
				break;
			case 'menu':
				var res = {
					path: "/member/vipGoods/vipGoods?id=" + this.data.id + "&user_id=" + user_info.id + "&mch_id=" + mch_info.id,
					title: self.data.goods.brand.name + ' | ' + self.data.goods.name,
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
		var quick = self.data.quick;
		if (quick) {
			var carGoods = self.data.carGoods;
			if (carGoods) {
				var length = carGoods.length;
				var goods_num = 0;
				for (var i = 0; i < length; i++) {
					if (carGoods[i].goods_id == self.data.id) {
						goods_num += parseInt(carGoods[i].num);
					}
				}
				self.setData({
					goods_num: goods_num
				});
			}
		}
		getApp().request({
			url: getApp().api.default.goods,
			data: {
				id: self.data.id,
				from: 1
			},
			success: function(res) {
				if (res.code == 0) {
					var detail = res.data.detail;
					WxParse.wxParse("detail", "html", detail, self);
					var goods = res.data;
					goods.attr_pic = res.data.attr_pic;
					goods.linkGoods = res.data.link_goods;
					// goods.c1 = res.data.commission_price;
					self.setData({
						goods: goods,
						// goods_attr:res.data.attr,
						// attr_group_list: res.data.attr_group_list,
						btn: true
					});
					self.getGoodsLink()
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
								wx.redirectTo({
									url: '/pages/index/index'
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
				from: 1
			},
			success: function(res) {
				if (res.code == 0) {
					// var attr_group_list = res.data.attr_group_list
					// var goods_attr = res.data.attr
					// var attr_group_list_one = []
					// var goods_attr_one = []
					// var arr = []
					// var keys = Object.keys(attr_group_list);
					// for (let i = 0; i < keys.length; i++) {
					// 	arr[i] = attr_group_list[keys[i]].attr_list
					// }
					// console.log(arr[0]);
					// console.log(arr[1]);
					// attr_group_list_one = arr[0].concat(arr[1])
					// console.log(attr_group_list_one);
					// var self_attr_list = []
					// for (let i in attr_group_list_one) {
					// 	let attr_name = attr_group_list_one[i].attr_name
					// 	for (let j in goods_attr) {
					// 		attr_group_list_one[i].attr_list = []
					// 		if (goods_attr[j].attr_list[0].attr_name.indexOf(attr_name) > -1) {
					// 			attr_group_list_one[i].attr_list.push(goods_attr[j])
					// 		}
					// 		if (goods_attr[j].attr_list[1].attr_name.indexOf(attr_name) > -1) {
					// 			attr_group_list_one[i].attr_list.push(goods_attr[j])
					// 		}
					// 	}
					// }
					// console.log(attr_group_list_one);
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
	getGoodsLink: function() {
		var self = this
		getApp().request({
			url: getApp().api.default.goods_link,
			data: {
				brand_id: self.data.goods.brand_id,
				from: 1
			},
			success: function(res) {
				if (res.code == 0) {
					var arr = [[],[],[]]
					var j = 0
					for (let i in res.data) {
						arr[j].push(res.data[i])
						if(arr[j].length>=6*(j+1)) {
							j++
						}
					}
					var index = 2
					self.setData({
						linkGoods: res.data,
						sameList: arr
					})
				}
			}
		})
	},

	// getCommentList: function(more) {
	//     var self = this;
	//     if (more && self.data.tab_comment != "active")
	//         return;
	//     if (is_loading_comment)
	//         return;
	//     if (!is_more_comment)
	//         return;
	//     is_loading_comment = true;
	//     getApp().request({
	//         url: getApp().api.default.comment_list,
	//         data: {
	//             goods_id: self.data.id,
	//             page: p,
	//         },
	//         success: function(res) {
	//             if (res.code != 0)
	//                 return;
	//             is_loading_comment = false;
	//             p++;
	//             self.setData({
	//                 comment_count: res.data.comment_count,
	//                 comment_list: more ? self.data.comment_list.concat(res.data.list) : res.data.list,
	//             });
	//             if (res.data.list.length == 0)
	//                 is_more_comment = false;
	//         }
	//     });
	// },

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
