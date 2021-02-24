var utils = require('../../../utils/helper.js');
var WxParse = require('../../../wxParse/wxParse.js');
var gSpecificationsModel = require('../../../components/goods/specifications_model.js'); //商城多规格选择
var goodsBanner = require('../../../components/goods/goods_banner.js');
var goodsInfo = require('../../../components/goods/goods_info.js');
var goodsBuy = require('../../../components/goods/goods_buy.js');
import util from '../../../utils/util.js'
var is_loading_comment = false;
var is_more_comment = true;
var p = 1;

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		pageType: "PINTUAN",
		hide: "hide",
		form: {
			number: 1,
			pt_detail: false,
		},
		tab_detail: "active",
		tab_comment: "",
		comment_list: [],
		comment_count: {
			score_all: 0,
			score_3: 0,
			score_2: 0,
			score_1: 0
		},
		hasStart: true,
		lestNum: 0,
		role: getApp().core.getStorageSync('role'),
		active2: 1,
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
		wx.hideShareMenu()
		// var parent_id = 0;
		// var user_id = options.user_id;
		// var scene = decodeURIComponent(options.scene);
		// if (typeof user_id !== 'undefined') {
		// 	parent_id = user_id;
		// } else if (typeof scene !== 'undefined') {
		// 	var scene_obj = utils.scene_decode(scene);
		// 	if (scene_obj.gid) {
		// 		//parent_id = scene_obj.user_id;
		// 		options.gid = scene_obj.gid;
		// 	} else {
		// 		parent_id = scene;
		// 	}
		// } else {
		// 	if (typeof my !== 'undefined') {
		// 		if (getApp().query !== null) {
		// 			var query = getApp().query;
		// 			getApp().query = null;
		// 			options.id = query.gid;
		// 		}
		// 	}
		// }
		if (getApp().core.getStorageSync('rel_id') && options.scene) {
			options.gid = getApp().core.getStorageSync('rel_id')
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
							this.setData({
								id: options.gid || options.id,
								gsId: options.gid || options.id,
								oid: options.oid ? options.oid : 0,
							});
						}
						gSpecificationsModel.init(this);
						goodsBanner.init(this);
						goodsInfo.init(this);
						goodsBuy.init(this);
						this.goodsOnLoad()
						this.checkFirstOrder()
						this.getGoodsInfo(options);
					} else {
						wx.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				}
			})
		} else {
			this.setData({
				id: options.gid || options.id,
				gsId: options.gid || options.id,
				oid: options.oid ? options.oid : 0,
			});
			gSpecificationsModel.init(this);
			goodsBanner.init(this);
			goodsInfo.init(this);
			goodsBuy.init(this);
			this.goodsOnLoad()
			this.checkFirstOrder()
			this.getGoodsInfo(options);
		}
		var pages = getCurrentPages();
		var prevPage = pages.length < 2 ? false : true;
		if (prevPage) {
			this.setData({
				isReturn: true
			})
		}
		this.setData({
			nickName: getApp().core.getStorageSync('USER_INFO').nickname,
			avatarUrl: getApp().core.getStorageSync('USER_INFO').avatar_url,
			userId: getApp().core.getStorageSync('USER_INFO').id,
			mchId: getApp().core.getStorageSync('_mchInfo').id,
			storeId: getApp().core.getStorageSync('STORE').id,
			type: 2,
			// group_checked: options.group_id ? options.group_id : 0
		});
		var store = getApp().core.getStorageSync(getApp().const.STORE);
		this.setData({
			store: store,
			role: getApp().core.getStorageSync('role'),
		});
	},
	addCart: function() {
		var token = getApp().core.getStorageSync('ACCESS_TOKEN')
		if (!token) {
			this.setData({
				showGetLogin: true,
				user_info_show: true,
			})
			return
		}
		this.submit('ADD_CART');
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {
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
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {
		getApp().page.onUnload(this);
		getApp().core.removeStorageSync(getApp().const.PT_GROUP_DETAIL);
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
		var user_info = getApp().core.getStorageSync(getApp().const.USER_INFO);
		var mch_info = wx.getStorageSync('_mchInfo');
		switch (res.from) {
			case 'button':
				var res = {
					path: "/pages/pt/details/details?id=" + this.data.id + "&user_id=" + user_info.id + "&mch_id=" + mch_info.id,
					title: self.data.goods.name,
					imageUrl: self.data.sharePic,
				};
				break;
			case 'menu':
				var res = {
					path: "/pages/pt/details/details?id=" + this.data.id + "&user_id=" + user_info.id + "&mch_id=" + mch_info.id,
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
	getGoodsAttr: function() {
		var self = this
		getApp().request({
			url: getApp().api.default.goods_attr,
			data: {
				id: self.data.id,
				from: 3,
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
					self.setData({
						goods_attr: res.data.attr,
						attr_group_list: res.data.attr_group_list,
						lestNum: lestNum
					})
					self.selectDefaultAttr(res.data);
					self.getJDSend()
				}

			}
		})
	},
	/**
	 * 获取商品详情
	 */
	getGoodsInfo: function(e) {
		var gid = e.gid;
		var self = this;
		getApp().core.showLoading({
			title: "正在加载",
			mask: true,
		});
		getApp().core.showNavigationBarLoading();
		getApp().request({
			url: getApp().api.default.goods,
			method: "get",
			data: {
				id: self.data.id,
				from: 3
			},
			success: function(res) {
				if (res.code == 0) {
					self.countDownRun(res.data.end_time);
					var detail = res.data.detail;
					WxParse.wxParse("detail", "html", detail, self);
					// getApp().core.setNavigationBarTitle({
					//     title: res.data.info.name,
					// })
					getApp().core.hideNavigationBarLoading();
					// var reduce_price = (res.data.original_price - res.data.price).toFixed(2);
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
					var goods = res.data;
					// goods.service_list = res.data.service;
					let nowtime = Date.parse(new Date()) / 1000;
					let starttime = goods.start_time;
					let hasStart = true;
					if (starttime > nowtime) {
						hasStart = false
					}
					self.setData({
						goods: goods,
						['goods.only_price']: goods.price,
						attr_group_list: res.data.attr_group_list,
						limit_time: res.data.limit_time,
						group_list: res.data.groupList,
						group_num: res.data.groupList.length,
						goods_id: res.data.goods_id,
						hasStart: hasStart,
					});
					self.getGoodsAttr()
					self.getCommentList();
					self.getAllLook()

				} else {
					getApp().core.showModal({
						title: '提示',
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
			},
			complete: function(res) {
				getApp().core.hideLoading();
			}
		});
	},
	more: function() {
		this.setData({
			'pt_detail': true
		})
	},
	end_more: function() {
		this.setData({
			'pt_detail': false
		})
	},
	previewImage: function(e) {
		var urls = e.currentTarget.dataset.url;
		getApp().core.previewImage({
			urls: [urls]
		});
	},
	/**
	 * 执行倒计时
	 */
	countDownRun: function(limit_time_ms) {
		var self = this;
		var leftTime = Number(limit_time_ms)
		var endTime = new Date(leftTime);
		var month = endTime.getMonth() + 1
		if (month < 10) {
			month = '0' + month
		}
		var d = endTime.getDate()
		if (d < 10) {
			d = '0' + d
		}
		var h = endTime.getHours();
		if (h < 10) {
			h = '0' + h
		}
		var m = endTime.getMinutes();
		if (m < 10) {
			m = '0' + m
		}
		var show_end_time = month + '月' + d + '日' + '  ' + h + ':' + m
		self.setData({
			show_end_time: show_end_time
		})
	},

	/**
	 * 去参团
	 */
	goToGroup: function(e) {
		getApp().core.navigateTo({
			url: '/pages/pt/group/details?oid=' + e.target.dataset.id,
		})
	},
	/**
	 * 评论列表页
	 */
	/**
	 * 拼团规则
	 */
	goArticle: function(e) {
		if (this.data.group_rule_id) {
			getApp().core.navigateTo({
				url: '/pages/article-detail/article-detail?id=' + this.data.group_rule_id,
			})
		}
	},


	/**
	 * 团购
	 */
	buyNow: util.throttle(function() {
		var token = getApp().core.getStorageSync('ACCESS_TOKEN')
		if (!token) {
			this.setData({
				showGetLogin: true,
				user_info_show: true,
			})
			return
		}
		this.submit('GROUP_BUY', 0);
	}, 1000),
	/**
	 * 单独购买
	 */
	onlyBuy: function() {
		var self = this;
		this.submit('ONLY_BUY', 0);
	},
	/**
	 * 订单提交
	 */
	submit: function(type, group_id) {
		var self = this;
		var groupNum = type == 'GROUP_BUY';
		if (!self.data.show_attr_picker || groupNum != self.data.groupNum) {
			self.setData({
				show_attr_picker: true,
				groupNum: groupNum,
			});

			return true;
		}

		if (self.data.form.number > self.data.goods.num) {
			getApp().core.showToast({
				title: "商品库存不足，请选择其它规格或数量",
				icon: "none",
			});
			return true;
		}
		// var attr_group_list = self.data.attr_group_list;
		// var checked_attr_list = [];
		// for (var i in attr_group_list) {
		//     var attr = false;
		//     for (var j in attr_group_list[i].attr_list) {
		//         if (attr_group_list[i].attr_list[j].checked) {
		//             attr = {
		//                 attr_id: attr_group_list[i].attr_list[j].attr_id,
		//                 attr_name: attr_group_list[i].attr_list[j].attr_name,
		//             };
		//             break;
		//         }
		//     }
		//     if (!attr) {
		//         getApp().core.showToast({
		//             title: "请选择" + attr_group_list[i].attr_group_name,
		//             image: "/images/icon-warning.png",
		//         });
		//         return true;
		//     } else {
		//         checked_attr_list.push({
		//             attr_group_id: attr_group_list[i].attr_group_id,
		//             attr_group_name: attr_group_list[i].attr_group_name,
		//             attr_id: attr.attr_id,
		//             attr_name: attr.attr_name,
		//         });
		//     }
		// }

		self.setData({
			show_attr_picker: false,
		});
		var parent_id = 0;
		if (self.data.oid) {
			type = "GROUP_BUY_C";
			parent_id = self.data.oid;

		}
		var goods_list = [];
		goods_list.push({
			// goods_id: self.data.goods.id,
			// deliver_type: self.data.goods.type,
			goods_id: self.data.id,
			num: self.data.form.number,
			sku: self.data.goods.sku,
			type: type,
			from: 3,
			group_id: group_id,
			parent_id: parent_id
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

		getApp().core.redirectTo({
			url: "/pages/new-order-submit/new-order-submit?mch_list=" + JSON.stringify(mch_list),
		});

	},

	/**
	 * 拼团倒计时
	 */
	countDown: function() {
		var self = this;
		setInterval(function() {
			var group_list = self.data.group_list;
			for (var i in group_list) {
				var leftTime = (new Date(group_list[i]['limit_time_ms'][0], group_list[i]['limit_time_ms'][1] - 1, group_list[
						i]['limit_time_ms'][2], group_list[i]['limit_time_ms'][3], group_list[i]['limit_time_ms'][4], group_list[i]
					['limit_time_ms'][5])) - (new Date()); //计算剩余的毫秒数  
				var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数 
				var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时
				var minutes = parseInt(leftTime / 1000 / 60 % 60, 10); //计算剩余的分钟
				var seconds = parseInt(leftTime / 1000 % 60, 10); //计算剩余的秒数

				days = self.checkTime(days);
				hours = self.checkTime(hours);
				minutes = self.checkTime(minutes);
				seconds = self.checkTime(seconds);
				group_list[i].limit_time = {
					days: days,
					hours: hours > 0 ? hours : '00',
					mins: minutes > 0 ? minutes : '00',
					secs: seconds > 0 ? seconds : '00',
				};
				self.setData({
					group_list: group_list,
				});
			}
		}, 1000);
	},
	/**
	 * 图片放大
	 */
	bigToImage: function(e) {
		var urls = this.data.comment[e.target.dataset.index]['pic_list'];
		getApp().core.previewImage({
			current: e.target.dataset.url, // 当前显示图片的http链接
			urls: urls // 需要预览的图片http链接列表
		})
	},

	// groupCheck: function() {
	// 	var self = this;
	// 	var attr_group_num = self.data.attr_group_num;
	// 	var attr_list = self.data.attr_group_num.attr_list;
	// 	for (var i in attr_list) {
	// 		attr_list[i].checked = false;
	// 	}
	// 	attr_group_num.attr_list = attr_list;

	// 	var goods = self.data.goods;
	// 	self.setData({
	// 		group_checked: 0,
	// 		attr_group_num: attr_group_num,
	// 	});

	// 	var attr_group_list = self.data.attr_group_list;
	// 	var check_attr_list = [];
	// 	var check_all = true;
	// 	for (var i in attr_group_list) {
	// 		var group_checked = false;
	// 		for (var j in attr_group_list[i].attr_list) {
	// 			if (attr_group_list[i].attr_list[j].checked) {
	// 				check_attr_list.push(attr_group_list[i].attr_list[j].attr_id);
	// 				group_checked = true;
	// 				break;
	// 			}
	// 		}
	// 		if (!group_checked) {
	// 			check_all = false;
	// 			break;
	// 		}
	// 	}
	// 	if (!check_all)
	// 		return;
	// 	getApp().core.showLoading({
	// 		title: "正在加载",
	// 		mask: true,
	// 	});

	// 	getApp().request({
	// 		url: getApp().api.group.goods_attr_info,
	// 		data: {
	// 			goods_id: self.data.goods.id,
	// 			group_id: self.data.group_checked,
	// 			attr_list: JSON.stringify(check_attr_list),
	// 		},
	// 		success: function(res) {
	// 			getApp().core.hideLoading();
	// 			if (res.code == 0) {
	// 				var goods = self.data.goods;
	// 				goods.price = res.data.price;
	// 				goods.num = res.data.num;
	// 				goods.attr_pic = res.data.pic;
	// 				// goods.original_price = res.data.single;
	// 				goods.single_price = res.data.single_price ? res.data.single_price : 0;
	// 				goods.group_price = res.data.price;
	// 				goods.is_member_price = res.data.is_member_price;

	// 				self.setData({
	// 					goods: goods,
	// 				});
	// 			}
	// 		}
	// 	});
	// },

	// attrNumClick: function(e) {
	// 	var self = this;
	// 	var attr_id = e.target.dataset.id;

	// 	var attr_group_num = self.data.attr_group_num;
	// 	var attr_list = attr_group_num.attr_list;

	// 	for (var i in attr_list) {
	// 		if (attr_list[i].id == attr_id) {
	// 			attr_list[i].checked = true;
	// 		} else {
	// 			attr_list[i].checked = false;
	// 		}
	// 	}
	// 	attr_group_num.attr_list = attr_list;

	// 	self.setData({
	// 		attr_group_num: attr_group_num,
	// 		group_checked: attr_id,
	// 	});

	// 	var attr_group_list = self.data.attr_group_list;
	// 	var check_attr_list = [];
	// 	var check_all = true;
	// 	for (var i in attr_group_list) {
	// 		var group_checked = false;
	// 		for (var j in attr_group_list[i].attr_list) {
	// 			if (attr_group_list[i].attr_list[j].checked) {
	// 				check_attr_list.push(attr_group_list[i].attr_list[j].attr_id);
	// 				group_checked = true;
	// 				break;
	// 			}
	// 		}
	// 		if (!group_checked) {
	// 			check_all = false;
	// 			break;
	// 		}
	// 	}
	// 	if (!check_all)
	// 		return;
	// 	getApp().core.showLoading({
	// 		title: "正在加载",
	// 		mask: true,
	// 	});

	// 	getApp().request({
	// 		url: getApp().api.group.goods_attr_info,
	// 		data: {
	// 			goods_id: self.data.goods.id,
	// 			group_id: self.data.group_checked,
	// 			attr_list: JSON.stringify(check_attr_list),
	// 		},
	// 		success: function(res) {
	// 			getApp().core.hideLoading();
	// 			if (res.code == 0) {
	// 				var goods = self.data.goods;
	// 				goods.price = res.data.price;
	// 				goods.num = res.data.num;
	// 				goods.attr_pic = res.data.pic;
	// 				// goods.original_price = res.data.single;
	// 				goods.single_price = res.data.single_price ? res.data.single_price : 0;
	// 				goods.group_price = res.data.price
	// 				goods.is_member_price = res.data.is_member_price;
	// 				self.setData({
	// 					goods: goods,
	// 				});
	// 			}
	// 		}
	// 	});

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
	}
})
