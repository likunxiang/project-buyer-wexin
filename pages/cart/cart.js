import util from '../../utils/util.js'
var gSpecificationsModel = require('../../components/goods/specifications_model.js'); //商城多规格选择
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		y: getApp().core.getSystemInfoSync().windowHeight,
		pageType: 'cart',
		total_price: 0.00,
		cart_check_all: false,
		cart_list: {},
		loading: true,
		check_all_self: false,
		show: 2,
		submitState: true,
		like_list: [],
		isOpenStandard: false,
		delBtnWidth: 82,
		page: 1,
		show_attr_picker: false,
		goods: {},
		form: {},
		is_sel_2: 2,
		is_sel_13: 2,
		is_sel_16: 2,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		getApp().page.onLoad(this, options);
		wx.hideShareMenu()
	},
	// 购物车相关
	openCart(e) {
		var id = e.currentTarget.dataset.id
		var index = e.currentTarget.dataset.index
		var goods = this.data.goodList[index]
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

				}
			});
		}
	},
	openEditStandard: function(e) {
		var goods_id = e

		this.setData({
			isOpenStandard: true
		})
	},
	// 获取商品信息
	getGoodsMsg: function(goods_id) {
		var self = this
		getApp().request({
			url: getApp().api.default.goods,
			data: {
				id: goods_id
			}
		})
	},
	/**
	 * 用户点击右上角分享
	 */
	// onShareAppMessage: function() {
	// 	getApp().page.onShareAppMessage(this);
	// 	var self = this;
	// 	var user_info = getApp().getUser();
	// 	var mch_id = wx.getStorageSync('_mchInfo').id;
	// 	return {
	// 		path: "/pages/cart/cart?user_id=" + user_info.id + "&mch_id=" + mch_id,
	// 		title: self.data.store.name
	// 	};
	// },
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},
	//手指刚放到屏幕触发
	touchS: function(e) {
		//判断是否只有一个触摸点
		// console.log(e.touches[0].clientX)
		var self = this
		var index = e.currentTarget.dataset.index;
		var key = e.currentTarget.dataset.key;
		if (e.touches.length == 1) {
			this.setData({
				//记录触摸起始位置的X坐标
				startX: e.touches[0].clientX
			});
			self.data.cart_list[key].list[index].Style = '';
			//获取手指触摸的是哪一项
			self.setData({
				['list[' + key + '].list[' + index + '].Style']: self.data.cart_list[key].list[index].Style,
				index: index,
			})
		}
	},
	//触摸时触发，手指在屏幕上每移动一次，触发一次
	touchM: function(e) {
		var that = this
		var index = e.currentTarget.dataset.index;
		var key = e.currentTarget.dataset.key;
		if (e.touches.length == 1) {
			//记录触摸点位置的X坐标
			var moveX = e.touches[0].clientX;
			//计算手指起始点的X坐标与当前触摸点的X坐标的差值
			var disX = that.data.startX - moveX;
			//delBtnWidth 为右侧按钮区域的宽度
			var delBtnWidth = that.data.delBtnWidth;
			var txtStyle = "";
			if (disX == 0 || disX < 0) { //如果移动距离小于等于0，文本层位置不变
				txtStyle = "margin-left:0px";
			} else if (disX > 0) { //移动距离大于0，文本层left值等于手指移动距离
				txtStyle = "margin-left:-" + disX + "px";
				if (disX >= delBtnWidth) {
					//控制手指移动距离最大值为删除按钮的宽度
					txtStyle = "margin-left:-" + 150 + "rpx";
				}
				that.data.cart_list[key].list[index].Style = txtStyle;
				//获取手指触摸的是哪一项
				that.setData({
					list: that.data.cart_list,
					index: index,
					stopStyle: 'overflow：hidden;'
				})
			}
		};
	},
	touchE: function(e) {

		var that = this
		that.clearDelete()
		var index = e.currentTarget.dataset.index;
		var key = e.currentTarget.dataset.key;
		if (e.changedTouches.length == 1) {
			//手指移动结束后触摸点位置的X坐标
			var endX = e.changedTouches[0].clientX;
			//触摸开始与结束，手指移动的距离
			var disX = that.data.startX - endX;
			var delBtnWidth = that.data.delBtnWidth;
			//如果距离小于删除按钮的1/2，不显示删除按钮
			var sty = disX > delBtnWidth / 2 ? "margin-left:-" + 150 + "rpx" : "left:0px";
			that.data.list[key].list[index].Style = sty;
			//获取手指触摸的是哪一项
			that.setData({
				list: that.data.list,
				index: index,
			})
		}
	},
	clearDelete: function() { //移动其他商品时，当前商品删除none
		// for (var i = 0; i < this.data.list.length; i++) {
		// 	this.data.list[i].Style = "left:0px";
		// 	this.data.list[i].txtStyle = "display:none";
		// }
		for (let i in this.data.list) {
			for (let j in this.data.list[i].list) {
				this.data.list[i].list[j].Style = "left:0px";
				this.data.list[i].list[j].txtStyle = "display:none";
			}
		}
		this.setData({
			list: this.data.list,
		})
	},
	onPullDownRefresh() {
		this.getCartList();
		var self = this;
		self.setData({
			show_cart_edit: false,
			check_all_self: false,
			stopLoadMore: false,
			page: 1
		});
	},
	// 规格确定
	saveEditStandard: function(e) {
		var self = this
		var cart_list = self.data.cart_list
		var index = self.data.editIndex
		var key = self.data.editKey
		cart_list[key].list[index].num = parseInt(self.data.form.number)
		cart_list[key].list[index].max_num = parseInt(self.data.goods.num)
		cart_list[key].list[index].attr_list = self.data.goods.attr_list
		cart_list[key].list[index].sku = self.data.goods.sku
		cart_list[key].list[index].price = self.data.goods.price * self.data.form.number
		cart_list[key].list[index].unitPrice = self.data.goods.price
		cart_list[key].list[index].m_price = self.data.goods.m_price
		self.setData({
			cart_list: cart_list,
			// ['cart_list[' + index + '].max_num']: parseInt(max_num),
			// ['cart_list[' + index + '].attr_list']: attr_list,
			// ['cart_list[' + index + '].sku']: sku,
			// ['cart_list[' + index + '].price']: price,
			// ['cart_list[' + index + '].unitPrice']: unitPrice
		});
		self.oneSaveCart(index, key)
		self.hideAttrPicker()
		self.updateTotalPrice();
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		getApp().page.onShow(this);
		gSpecificationsModel.init(this);
		this.getCartList()
		var self = this;
		self.setData({
			cart_check_all: false,
			show_cart_edit: false,
			check_all_self: false,
		});
	},

	getCartList: function() {
		var self = this;
		getApp().core.showNavigationBarLoading();
		self.setData({
			show_no_data_tip: false,
			loading: true,
			submitState: true,
			page: 1,
			stopLoadMore: false,
		});
		getApp().request({
			url: getApp().api.cart.list,
			data: {
				address_id: getApp().core.getStorageSync(getApp().const.PICKER_ADDRESS).id || '',
			},
			success: function(res) {

				if (res.code == 0) {

					let total_price = 0;
					let list = res.data.list
					for (let i in res.data.list) {
						console.log(res.data.list[i])
						if (res.data.list[i].list.length > 0) {
							var show_cart = true
						}
						for (let j in res.data.list[i].list) {
							if (res.data.list[i].list[j].is_sel == 1) {
								total_price = total_price + res.data.list[i].list[j].unitPrice * res.data.list[i].list[j].num
							}
						}

					}
					// 判断各供应商 初始选择状态
					for (let i in res.data.list) {
						var is_sel_2
						for (let j in res.data.list[i].list) {
							// 判断各供应商 初始选择状态
							if (i == 2 && !res.data.list[i].list[j].disabled) {
								if (res.data.list[i].list[j].is_sel == 2) {
									is_sel_2 = 2
									break
								} else {
									is_sel_2 = 1
								}
							}
						}
					}
					for (let i in res.data.list) {
						var is_sel_13
						for (let j in res.data.list[i].list) {
							// 判断各供应商 初始选择状态
							if (i == 13 && !res.data.list[i].list[j].disabled) {
								if (res.data.list[i].list[j].is_sel == 2) {
									is_sel_13 = 2
									break
								} else {
									is_sel_13 = 1
								}
							}
						}
					}

					for (let i in res.data.list) {
						var is_sel_16
						for (let j in res.data.list[i].list) {
							// 判断各供应商 初始选择状态
							if (i == 16 && !res.data.list[i].list[j].disabled) {
								if (res.data.list[i].list[j].is_sel == 2) {
									is_sel_16 = 2
									break
								} else {
									is_sel_16 = 1
								}
							}
						}
					}
					let cart_list = res.data.list
					let sku_list = []
					for (let x in cart_list) {
						for (let y in cart_list[x].list) {
							if (cart_list[x].list[y].sku_list.length > 0) {
								for (let z in cart_list[x].list[y].sku_list) {
									if (cart_list[x].list[y].sku_list[z].num > 0) {
										cart_list[x].list[y].is_stock = 0
										break
									}
								}
							}
						}
					}
					self.setData({
						list: list,
						cart_list: cart_list,
						total_price: total_price.toFixed(2),
						show_cart_edit: false,
						total_price: res.data.all_price,
						count: res.data.row_count,
						show_cart: show_cart,
						is_sel_2: is_sel_2,
						is_sel_13: is_sel_13,
						is_sel_16: is_sel_16
					});
					// let listarr = self.data.cart_list
					// let num = 0
					// for (let i in self.data.cart_list) {
					// 	if (self.data.cart_list[i].is_sel == 1) {
					// 		num++;
					// 	}

					// }
					// if (num==listarr.length) {
					// 	var cart_check_all = true
					// } else {
					// 	var cart_check_all = false
					// }
					// self.setData({
					// 	cart_check_all: cart_check_all,
					// })
				}
				// self.setData({
				// 	show_no_data_tip: (self.data.cart_list.length == 0),
				// });
			},
			complete: function() {
				getApp().core.hideNavigationBarLoading();
				getApp().core.stopPullDownRefresh();
				self.setData({
					loading: false,
				});
			}
		});
		// TODO
		if (JSON.stringify(self.data.cart_list) == "{}") {
			// 猜你喜欢

			getApp().request({
				url: getApp().api.default.walk_goods_rec,
				data: {
					position: 2
				},
				success: function(res) {
					if (res.code == 0) {
						self.setData({
							like_list: res.data.list,
							cart_empty_img: getApp().core.getStorageSync('_img').cart_empty

						});
					}
				}
			});

		}

	},
	showAttrPicker: function(e) {
		var self = this
		// var token = getApp().core.getStorageSync('ACCESS_TOKEN')
		// if (!token) {
		// 	self.setData({
		// 		showGetLogin: true,
		// 		user_info_show: true,
		// 	})
		// 	return
		// }
		var id = e.currentTarget.dataset.id
		var goods_id = self.data.goods_id || 0
		var num = e.currentTarget.dataset.num
		var index = e.currentTarget.dataset.index
		var key = e.currentTarget.dataset.key
		var status = e.currentTarget.dataset.status
		var disabled = e.currentTarget.dataset.disabled
		var from = e.currentTarget.dataset.from
		if (disabled == true && status == 0) {
			wx.showToast({
				title: '抱歉，该商品库存不足或已下架',
				icon: 'none',
				duration: 2000
			})
			return false
		}
		if (status == 0) {
			wx.showToast({
				title: '该商品已下架',
				duration: 2500,
				icon: 'none'
			})
			return
		}
		self.setData({
			['form.number']: num,
			editIndex: index,
			editKey: key,
			goods_id: id,
			from: from
		})
		self.setData({
			show_attr_picker: true,
		});
		if (goods_id != id) {
			self.getGoodsAttr(id)
		}

	},
	getGoodsAttr: function(id) {
		var self = this
		getApp().request({
			url: getApp().api.default.goods_attr,
			data: {
				id: id,
				// from: 1
			},
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						goods_attr: res.data.attr,
						attr_group_list: res.data.attr_group_list,
					});
					// var goods_attr = res.data.attr
					// var attr_group_list = res.data.attr_group_list
					// for (var i in attr_group_list) {
					// 	for (var j in attr_group_list[i].attr_list) {
					// 		if (j == 0)
					// 			attr_group_list[i].attr_list[j]['checked'] = true;
					// 	}
					// }

					// let goods = {};
					// goods.attr_pic = goods_attr[0].pic;
					// console.log(goods.attr_pic);
					// goods.num = goods_attr[0].num;
					// goods.c1 = goods_attr[0].c1;
					// goods.sku = goods_attr[0].sku;
					// goods.price = goods_attr[0].price;
					// goods.original_price = goods_attr[0].va;
					// self.setData({
					// 	goods: goods,
					// 	goods_attr: res.data.attr,
					// 	attr_group_list: self.data.attr_group_list
					// });
					self.selectDefaultAttr(res.data);

				}

			}
		})
	},

	//购物车减少
	cartLess: function(e) {
		var self = this;
		var cart_list = self.data.cart_list;
		var index = e.currentTarget.dataset.index
		var key = e.currentTarget.dataset.key
		// for (var i in cart_list) {
		// 	if (e.currentTarget.id == cart_list[i]['cart_id']) {
		// 		cart_list[i]['num'] = self.data.cart_list[i]['num'] - 1;
		// 		cart_list[i]['price'] = self.data.cart_list[i]['unitPrice'] * cart_list[i]['num'];
		// 		self.setData({
		// 			cart_list: cart_list,
		// 		});
		// 	}
		// }
		if (e.currentTarget.id == cart_list[key].list[index]['cart_id']) {
			cart_list[key].list[index].num = self.data.cart_list[key].list[index]['num'] - 1;
			cart_list[key].list[index].price = self.data.cart_list[key].list[index]['unitPrice'] * cart_list[key].list[index]
				['num'];
			self.setData({
				cart_list: cart_list
			});
		}
		self.oneSaveCart(index, key)
		self.updateTotalPrice();
	},
	//购物车添加
	cartAdd: function(e) {
		var self = this;
		var index = e.currentTarget.dataset.index
		var key = e.currentTarget.dataset.key
		var cart_list = self.data.cart_list;
		// for (var i in cart_list) {
		// 	if (e.currentTarget.id == cart_list[i]['cart_id']) {
		// 		cart_list[i]['num'] = self.data.cart_list[i]['num'] + 1;
		// 		cart_list[i]['price'] = self.data.cart_list[i]['unitPrice'] * cart_list[i]['num'];
		// 		self.setData({
		// 			['cart_list[' + index + '].is_sel']: self.data.cart_list[index].is_sel,
		// 		});
		// 	}
		// }
		if (e.currentTarget.id == cart_list[key].list[index]['cart_id']) {
			cart_list[key].list[index].num = self.data.cart_list[key].list[index]['num'] + 1;
			cart_list[key].list[index].price = self.data.cart_list[key].list[index]['unitPrice'] * cart_list[key].list[index]
				['num'];
			self.setData({
				cart_list: cart_list
			});
		}
		self.oneSaveCart(index, key)
		self.updateTotalPrice();
	},
	cartCheck: function(e) {
		var self = this;
		var cart_list = self.data.cart_list
		var index = e.currentTarget.dataset.index;
		var key = e.currentTarget.dataset.key;
		var cart_id = e.currentTarget.dataset.id
		var type = e.currentTarget.dataset.type;
		var mch_index = e.currentTarget.dataset.mchIndex;
		var isAll = true
		self.setData({
			submitState: false
		});
		cart_list[key].list[index].is_sel = cart_list[key].list[index].is_sel == 1 ? 2 : 1;
		self.setData({
			cart_list: cart_list,
		});
		for (var i in self.data.cart_list) {
			for (var j in self.data.cart_list[i].list) {
				if (self.data.cart_list[i].list[j].is_sel == 2) {
					isAll = false;
				} else {
					self.setData({
						submitState: true
					});
				}
			}
		}
		for (var i in self.data.cart_list) {
			for (var j in self.data.cart_list[i].list) {
				if (i == 2 && !cart_list[i].list[j].disabled) {
					if (self.data.cart_list[i].list[j].is_sel == 2) {
						self.setData({
							is_sel_2: 2
						})
						break
					} else {
						self.setData({
							is_sel_2: 1
						})
					}
				}

			}
		}
		for (var i in self.data.cart_list) {
			for (var j in self.data.cart_list[i].list) {
				if (i == 13 && !cart_list[i].list[j].disabled) {
					if (self.data.cart_list[i].list[j].is_sel == 2) {
						self.setData({
							is_sel_13: 2
						})
						break
					} else {
						self.setData({
							is_sel_13: 1
						})
					}
				}

			}
		}
		for (var i in self.data.cart_list) {
			for (var j in self.data.cart_list[i].list) {
				if (i == 16 && !cart_list[i].list[j].disabled) {
					if (self.data.cart_list[i].list[j].is_sel == 2) {
						self.setData({
							is_sel_16: 2
						})
						break
					} else {
						self.setData({
							is_sel_16: 1
						})
					}
				}

			}
		}


		if (isAll) {
			self.setData({
				cart_check_all: true
			});
		} else {
			self.setData({
				cart_check_all: false
			});
		}
		self.updateTotalPrice();
		self.oneSaveCart(index, key)
	},
	// 供应商2全选反选
	cartCheck2() {
		var self = this
		var cart_list = self.data.cart_list
		for (let i in cart_list) {
			for (let j in cart_list[i].list) {
				if (i == 2 && !cart_list[i].list[j].disabled) {
					if (self.data.is_sel_2 == 2) {
						cart_list[i].list[j].is_sel = 1
					} else {
						cart_list[i].list[j].is_sel = 2
					}
				}
			}
		}
		self.setData({
			cart_list: cart_list,
			is_sel_2: self.data.is_sel_2 == 2 ? 1 : 2
		})
		// self.updateTotalPrice();
		var sel = self.data.is_sel_2 == 2 ? 1 : 2
		self.checkAll(sel, 2)
	},
	cartCheck13() {
		var self = this
		var cart_list = self.data.cart_list
		for (let i in cart_list) {
			for (let j in cart_list[i].list) {
				if (self.data.show_cart_edit) {
					if (i == 13) {
						if (self.data.is_sel_13 == 2) {
							cart_list[i].list[j].is_sel = 1
						} else {
							cart_list[i].list[j].is_sel = 2
						}
					}
				} else {
					if (i == 13 && !cart_list[i].list[j].disabled) {
						if (self.data.is_sel_13 == 2) {
							cart_list[i].list[j].is_sel = 1
						} else {
							cart_list[i].list[j].is_sel = 2
						}
					}
				}
				
			}
		}
		self.setData({
			cart_list: cart_list,
			is_sel_13: self.data.is_sel_13 == 2 ? 1 : 2
		})
		// self.updateTotalPrice();
		var sel = self.data.is_sel_13 == 2 ? 1 : 2
		self.checkAll(sel, 13)
	},
	cartCheck16() {
		var self = this
		var cart_list = self.data.cart_list
		for (let i in cart_list) {
			for (let j in cart_list[i].list) {
				if (self.data.show_cart_edit) {
					if (i == 16) {
						if (self.data.is_sel_16 == 2) {
							cart_list[i].list[j].is_sel = 1
						} else {
							cart_list[i].list[j].is_sel = 2
						}
					}
				} else {
					if (i == 16 && !cart_list[i].list[j].disabled) {
						if (self.data.is_sel_16 == 2) {
							cart_list[i].list[j].is_sel = 1
						} else {
							cart_list[i].list[j].is_sel = 2
						}
					}
				}
				
			}
		}
		self.setData({
			cart_list: cart_list,
			is_sel_16: self.data.is_sel_16 == 2 ? 1 : 2
		})
		// self.updateTotalPrice();
		var sel = self.data.is_sel_16 == 2 ? 1 : 2
		self.checkAll(sel, 16)
	},
	cartCheckAll: function() {
		var self = this;
		var cart_list = self.data.cart_list;
		var checked
		if (self.data.cart_check_all) {
			checked = 2;
		} else {
			checked = 1;
		}
		for (var i in cart_list) {
			for (var j in cart_list[i].list) {
				if (!cart_list[i].list[j].disabled || self.data.show_cart_edit) {
					cart_list[i].list[j].is_sel = checked;
				}
			}

		}
		self.setData({
			cart_check_all: !self.data.cart_check_all,
			is_sel_16: checked,
			is_sel_2: checked,
			is_sel_13: checked,
			submitState: checked,
			cart_list: cart_list,
		});
		self.updateTotalPrice();
		var sel = checked == 2 ? 1 : 2
		self.checkAll(sel)
	},
	// 全选
	checkAll(sel, key) {

		getApp().request({
			url: getApp().api.cart.cart_click,
			data: {
				supplier_id: key || '',
				is_sel: sel == 2 ? 1 : 2
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						total_price: res.data
					})
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			}
		})
	},
	// 已选商品费用逻辑
	updateTotalPrice: function() {
		var self = this;
		var total_price = 0.00;
		var cart_list = self.data.cart_list;
		for (var i in cart_list) {
			for (var j in cart_list[i].list) {
				if (cart_list[i].list[j].is_sel == 1) {
					total_price += (+cart_list[i].list[j].price);
				}
			}


		}
		// self.setData({
		// 	total_price: total_price.toFixed(2),
		// });
	},
	gotoUnlock: util.throttle(function() {
		this.cartSubmit();
	}, 3000),
	/**
	 * 提交
	 *
	 */
	cartSubmit: function() {
		var self = this;
		var cart_list = self.data.cart_list;
		var mch_list = self.data.mch_list;
		var cart_id_list = [];
		var mch_id_list = [];
		var _mch_list = [];
		var goods_list = [];
		for (var i in cart_list) {
			for (var j in cart_list[i].list)
				if (cart_list[i].list[j].is_sel == 1) {
					cart_id_list.push(cart_list[i].list[j].cart_id);
					goods_list.push({
						cart_id: cart_list[i].list[j].cart_id,
						from: cart_list[i].list[j].from
					});
				}
		}
		if (cart_id_list.length > 0) {
			_mch_list.push({
				mch_id: 0,
				goods_list: goods_list
			});
		}
		if (cart_id_list.length == 0) {
			return true;
		}
		getApp().core.showLoading({
			title: '正在提交',
			mask: true,
		});
		getApp().core.hideLoading();
		self.saveCart(_mch_list, function() {
			getApp().core.navigateTo({
				url: '/pages/new-order-submit/new-order-submit?mch_list=' + JSON.stringify(_mch_list)
			});
		});

	},

	cartEdit: function() {
		var self = this;
		var cart_list = self.data.cart_list;
		for (var i in cart_list) {
			for (var j in cart_list[i].list) {
				cart_list[i].list[j].is_sel = 2;
			}

		}
		self.setData({
			cart_list: cart_list,
			show_cart_edit: true,
			cart_check_all: false,
			is_sel_13: 2,
			is_sel_16: 2
			
		});
		self.updateTotalPrice();
	},

	cartDone: function() {
		var self = this;
		var cart_list = self.data.cart_list;
		for (var i in cart_list) {
			for (var j in cart_list[i].list) {
				cart_list[i].list[j].is_sel = 2;
			}

		}
		self.setData({
			cart_list: cart_list,
			show_cart_edit: false,
			cart_check_all: false,
			is_sel_13: 2,
			is_sel_16: 2
		});
		self.updateTotalPrice();
	},
	// 单品删除
	delGoods: function(e) {
		var self = this;
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var key = e.currentTarget.dataset.key;
		var cart_id_list = []
		cart_id_list.push(id)
		getApp().core.showModal({
			content: "确认删除该商品",
			success: function(res) {
				if (res.cancel)
					return true;
				getApp().core.showLoading({
					title: "正在删除",
					mask: true,
				});
				getApp().request({
					url: getApp().api.cart.delete,
					data: {
						cart_id_list: cart_id_list.toString(),
					},
					success: function(res) {
						getApp().core.hideLoading();
						getApp().core.showToast({
							title: res.msg,
						});
						if (res.code == 0) {

							var list = self.data.list
							list[key].list.splice(index, 1)
							for (let i in this.data.list) {
								for (let j in this.data.list[i].list) {
									this.data.list[i].list[j].Style = "left:0px";
								}
							}
							self.setData({
								cart_list: list,
								list: self.data.list,
							})
							self.getCartList()
							// self.updateTotalPrice()
						}
						if (res.code == 1) {}
					}
				});
			}
		});
	},
	cartDelete: function() {
		var self = this;
		var cart_list = self.data.cart_list;
		var cart_id_list = [];
		for (var i in cart_list) {
			for (var j in cart_list[i].list) {
				if (cart_list[i].list[j].is_sel == 1)
					cart_id_list.push(cart_list[i].list[j].cart_id);
			}

		}
		if (cart_id_list.length == 0) {
			return true;
		}
		getApp().core.showModal({
			title: "提示",
			content: "确认删除" + cart_id_list.length + "项内容？",
			success: function(res) {
				if (res.cancel)
					return true;
				getApp().core.showLoading({
					title: "正在删除",
					mask: true,
				});
				getApp().request({
					url: getApp().api.cart.delete,
					data: {
						cart_id_list: cart_id_list.toString(),
					},
					success: function(res) {
						getApp().core.hideLoading();
						getApp().core.showToast({
							title: res.msg,
						});
						if (res.code == 0) {
							//self.cartDone();
							self.getCartList();
						}
						if (res.code == 1) {}
					}
				});
			}
		});
	},
	onHide: function() {
		var self = this;
	},
	onUnload: function() {
		var self = this;
	},

	saveCart: function(list, callback) {
		var self = this;
		var cart = JSON.stringify(list);
		getApp().request({
			url: getApp().api.cart.cart_edit,
			method: 'post',
			data: {
				list: cart,
			},
			success: function(res) {
				if (res.code == 0) {}
			},
			complete: function() {
				if (typeof callback == 'function')
					callback();
			}
		});
	},
	oneSaveCart: function(index, key) {
		var self = this;
		var obj = [{
			cart_id: self.data.cart_list[key].list[index].cart_id,
			sku: self.data.cart_list[key].list[index].sku,
			is_sel: self.data.cart_list[key].list[index].is_sel,
			num: self.data.cart_list[key].list[index].num
		}]
		var cart = JSON.stringify(obj);
		getApp().request({
			url: getApp().api.cart.cart_edit,
			method: 'post',
			data: {
				list: cart,
			},
			success: function(res) {
				if (res.code == 0) {
					if (key == 13) {
						var cart_list = self.data.cart_list
						self.data.cart_list[key].desc.text = res.msg
						self.data.cart_list[key].desc.status = res.data.status
						self.setData({
							cart_list: cart_list,
							total_price: res.data.all_price
						})
					}
					self.setData({
						total_price: res.data.all_price
					})
				}
			},
			complete: function() {

			}
		});
	},

	checkGroup: function(e) {
		var self = this;
		var type = e.currentTarget.dataset.type;
		var index = e.currentTarget.dataset.index;
		if (type == 'self') {
			for (var i in self.data.cart_list) {
				self.data.cart_list[i].checked = !self.data.check_all_self;
			}
			self.setData({
				check_all_self: !self.data.check_all_self,
				cart_list: self.data.cart_list,
			});
		}
		self.updateTotalPrice();
	},
	onReachBottom() {
		// var self = this
		// var url = getApp().api.cart.list
		// var self = this;
		// var page = self.data.page
		// var data = {}
		// getApp().core.pading(self, url, data, function(res) {
		// 	if (res.data.list.length == 0) {
		// 		self.setData({
		// 			stopLoadMore: true
		// 		})
		// 		return
		// 	}

		// 	var newGoodList = res.data.list
		// 	var nowGoodList = self.data.cart_list.concat(newGoodList)
		// 	self.setData({
		// 		list: nowGoodList,
		// 		cart_list: nowGoodList,
		// 	})
		// 	let list = self.data.cart_list
		// 	let num = 0
		// 	for (var i in self.data.cart_list) {
		// 		if (self.data.cart_list[i].is_sel == 1) {
		// 			num++;
		// 		}

		// 	}
		// 	if (num==list.length) {
		// 		var cart_check_all = true
		// 	} else {
		// 		var cart_check_all = false
		// 	}
		// 	self.setData({
		// 		cart_check_all: cart_check_all,
		// 	})
		// 	self.updateTotalPrice();

		// })



		// console.log(self.data.cart_list.length, self.data.count);
		// if (self.data.goodList.length < self.data.count) {
		// 	++page
		// 	self.setData({
		// 		page: page
		// 	})
		// } else {
		// 	return
		// }

		// getApp().core.showLoading({
		// 	title: '加载中'
		// })
		// getApp().request({
		// 	url: getApp().api.default.active_list,
		// 	data: {
		// 		page: page
		// 	},
		// 	success: function(res) {
		// 		getApp().core.hideLoading()
		// 		if (res.code == 0) {
		// 			var newGoodList = res.data.page.goods
		// 			var nowGoodList = self.data.goodList.concat(newGoodList)
		// 			self.setData({

		// 				goodList: nowGoodList,

		// 			})
		// 		}
		// 	}
		// })
	}

});
