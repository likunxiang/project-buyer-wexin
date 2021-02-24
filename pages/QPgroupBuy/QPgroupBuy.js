// pages/groupBuy/groupBuy.js
var gSpecificationsModel = require('../../components/goods/specifications_model.js'); //商城多规格选择
var share = require('../../components/share/share.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		share_modal_active: '',
		goods_qrcode_active: '',
		show_attr_picker: false, // 购物车
		pageType: 'group',
		page: 1,
		is_down: true,
		share_type: 'code',
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		getApp().page.onLoad(this, options);
		if (options.scene && getApp().core.getStorageSync('s_id')) {
			getApp().request({
				url: getApp().api.default.get_share_info,
				data: {
					sid: getApp().core.getStorageSync('s_id')
				},
				success: (res) => {
					if (res.code == 0) {
						if (res.data.rel_id) {
							this.setData({
								groupId: res.data.rel_id,
								mch: getApp().core.getStorageSync('_mchInfo'),
							})
							this.checkGroupGoods()
							this.getScrollList()
							setInterval(this.timeData, 60000)
						}
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
				groupId: options.id,
				mch: getApp().core.getStorageSync('_mchInfo'),
			})
			this.checkGroupGoods()
			this.getScrollList()
			setInterval(this.timeData, 60000)
		}
		// if (options.scene) {
		// 	var scene = decodeURIComponent(options.scene);
		// 	var scene_obj = getApp().helper.scene_decode(scene);
		// 	if (scene_obj.id) {
		// 		this.setData({
		// 			groupId: scene_obj.id,
		// 			mch: getApp().core.getStorageSync('_mchInfo'),
		// 		})
		// 	}
		// } else {
		// 	this.setData({
		// 		groupId: options.id,
		// 		mch: getApp().core.getStorageSync('_mchInfo'),
		// 	})
		// }
		wx.hideShareMenu()
	},
	goBack() {
		wx.navigateBack({
			fail: (res) => {
				wx.redirectTo({
					url: '/pages/index/index'
				})
			}
		})
	},
	getScrollList() {
		getApp().request({
			url: getApp().api.group.get_buy_record,
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						scrollList: res.data
					})
				}
			}
		})
	},
	getBackground() {
		getApp().request({
			url: getApp().api.group.get_pick_backgroud,
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						shareAcitivity: res.data.share_activity,
						is_down: true
					})
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false
					})
				}
			}
		})
	},
	// 倒计时
	timeData: function() {
		var self = this
		var end_date = self.data.end_date
		var ed, eh, em;
		ed = Math.floor(end_date / 60 / 60 / 24);
		eh = Math.floor(end_date / 60 / 60 % 24);
		em = Math.floor(end_date / 60 % 60);
		if (ed < 10) {
			ed = '0' + ed
		}
		if (eh < 10) {
			eh = '0' + eh
		}
		if (em < 10) {
			em = '0' + em
		}
		if (ed >= '00' && eh >= '00' & em >= '00') {
			self.setData({
				ed: ed,
				eh: eh,
				em: em,
				end_date: end_date - 60,
			})
		}

	},
	// 购物车相关
	openCart(e) {
		var id = e.currentTarget.dataset.id
		var index = e.currentTarget.dataset.index
		var goods = this.data.groupList[index]
		this.setData({
			show_attr_picker: true,
			goods: goods,
			['form.number']: 1
		})
		this.getGoodsAttr(id)
	},
	checkGroupGoods() {
		getApp().request({
			url: getApp().api.group.check_group,
			success: (res) => {
				if (res.code == 0) {
					let id = res.data.id
					this.setData({
						groupId: id,
						groupNotice: res.data.notice,
						groupImage: res.data.image,
						groupName: res.data.name
					})
					if (!getApp().core.setStorageSync('groupId', id)) {
						getApp().core.setStorageSync('groupId', id)
					}
					this.getGroupGoods(id)
				} else {}
			}
		})
	},
	getGoodsAttr: function(id) {
		var self = this
		getApp().request({
			url: getApp().api.default.goods_attr,
			data: {
				id: id,
				from: 4
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
					from: 4
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
					self.getCartNum()
				}
			});
		}
	},
	getGroupGoods() {
		getApp().request({
			url: getApp().api.group.group_list,
			data: {
				community_group_buy_id: this.data.groupId,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						end_date: res.data.surplus_time,
						groupList: res.data.list,
						minGoodsInfo: res.data.min_goods_info
					})
					this.timeData()
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			},
			complete: (res) => {
				getApp().core.hideLoading()
				getApp().core.stopPullDownRefresh()
			}
		})
	},
	showShareModal: function() {
		var self = this
		this.getBackground()
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
			is_down: false
		});
	},

	shareModalClose: function() {
		var self = this;
		self.setData({
			share_modal_active: "",
			no_scroll: false,
			is_commission: true,
		});
	},

	getGoodsQrcode: function() {
		var self = this;
		self.setData({
			goods_qrcode_active: "active",
			share_modal_active: "",
		});
		if (self.data.goods_qrcode) {
			return true;
		}
		this.getQrcode()
	},
	getQrcode() {
		var picInfo = this.data.minGoodsInfo
		var end_date = picInfo.end_date
		// 结束时间获取
		var endTime = new Date(end_date * 1000);
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
		var show_end_time = month + '月' + d + '日' + '  ' + h + ':' + m + '结束'
		getApp().request({
			url: getApp().api.default.activity_qrcode,
			data: {
				goods_pic: picInfo.goods_pic,
				act_name: picInfo.act_name,
				price_str: picInfo.price_str,
				end_date: show_end_time,
				activity: picInfo.activity,
				qrcode_type: 14
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						goods_qrcode: res.data.pic_url,
					});
				}
				if (res.code == 1) {
					this.goodsQrcodeClose();
					getApp().core.showModal({
						title: "提示",
						content: res.msg,
						showCancel: false,
						success: function(res) {
							if (res.confirm) {

							}
						}
					});
				}
			}
		})
	},
	saveGoodsQrcode: function() {
		var self = this;
		if (!getApp().core.saveImageToPhotosAlbum) {
			// 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
			getApp().core.showModal({
				title: '提示',
				content: '当前版本过低，无法使用该功能，请升级到最新版本后重试。',
				showCancel: false,
			});
			return;
		}

		getApp().core.showLoading({
			title: "正在保存图片",
			mask: false,
		});

		getApp().core.downloadFile({
			url: self.data.goods_qrcode,
			success: function(e) {
				getApp().core.showLoading({
					title: "正在保存图片",
					mask: false,
				});
				getApp().core.saveImageToPhotosAlbum({
					filePath: e.tempFilePath,
					success: function() {
						getApp().core.showModal({
							title: '提示',
							content: '商品海报保存成功',
							showCancel: false,
						});
					},
					fail: function(e) {
						getApp().core.showModal({
							title: '图片保存失败',
							content: e.errMsg,
							showCancel: false,
						});
					},
					complete: function(e) {
						getApp().core.hideLoading();
					}
				});
			},
			fail: function(e) {
				getApp().core.showModal({
					title: '图片下载失败',
					content: e.errMsg + ";" + self.data.goods_qrcode,
					showCancel: false,
				});
			},
			complete: function(e) {
				getApp().core.hideLoading();
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
		this.getCartNum()
		gSpecificationsModel.init(this);
		share.init(this)
		var pickAddress = getApp().core.getStorageSync('PICK_ADDRESS')
		this.setData({
			pickAddress: pickAddress
		})
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
		this.getGroupGoods()
		this.setData({
			page: 1,
			stopLoadMore: false
		})
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},
	getMore() {
		var self = this

		var page = self.data.page
		var index = page
		var data = {
			community_group_buy_id: this.data.groupId,
		}
		var url = getApp().api.group.group_list
		getApp().core.pading(self, url, data, function(res) {
			if (res.data.list.length == 0) {
				self.setData({
					stopLoadMore: true,
				})
				return
			}
			var newGoodList = res.data.list
			var nowGoodList = self.data.groupList.concat(newGoodList)
			self.setData({
				groupList: nowGoodList,
			})
		})
	},
	getCartNum: function() {
		var self = this
		getApp().request({
			url: getApp().api.default.cartCount,
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						cartNum: res.data.count
					})
				}
			}
		})
	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function(res) {
		var self = this;
		var title = '社区团购第一波开抢啦~源头直供品质保障，售后无忧'
		var user_info = getApp().getUser();
		var mch_info = wx.getStorageSync('_mchInfo');
		switch (res.from) {
			case 'button':
				var res = {
					path: "/pages/QPgroupBuy/QPgroupBuy?id=" + self.data.groupId + "&user_id=" + user_info.id + "&mch_id=" +
						mch_info.id,
					title: title,
					imageUrl: self.data.shareAcitivity,
				};
				self.shareModalClose()
				break;
			case 'menu':
				var res = {
					path: "/pages/QPgroupBuy/QPgroupBuy?id=" + self.data.groupId + "&user_id=" + user_info.id + "&mch_id=" +
						mch_info.id,
					title: title,
				}
				break;
			default:
				break;
		}

		return res;
	}
})
