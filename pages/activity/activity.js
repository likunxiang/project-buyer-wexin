// pages/activity/activity.js
import util from '../../utils/util.js'
var activity_id = ''
var gSpecificationsModel = require('../../components/goods/specifications_model.js'); //商城多规格选择
var toTop = require('../../components/toTop/toTop.js')
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		x: getApp().core.getSystemInfoSync().windowWidth,
		y: getApp().core.getSystemInfoSync().windowHeight,
		chooseOpen: false,
		optionList: [],
		moren: '全部品类',
		chooseText: '',
		isShowShare: false,
		cartNum: 0,
		is_show: false,
		goodListMsg: {},
		goodList: [],
		discountDefault: true,
		priceDefault: true,
		discountUp: true,
		priceUp: true,
		cat_id: '',
		page: 1,
		page_count: 0,
		count: 0, // 总的数据条数
		qrcode_pic: '', // 二维码图片
		role: 'user',
		scrollTop: false,
		chooseIns: 0,
		choose: [], //多选数组
		catsArr: [],
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom,
		pageType: 'normal',
		pageUrl: 'acitity',
		showChangeMore: false, //展示多选按钮
		is_top: false,
		topPosition: 0,
		is_show_head: true
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var self = this
		getApp().page.onLoad(this, options);
		toTop.init(this)
		// if (typeof my === 'undefined') {
		// 	var scene = decodeURIComponent(options.scene);
		// 	if (typeof scene !== 'undefined') {
		// 		var scene_obj = getApp().helper.scene_decode(scene);
		// 		if (scene_obj.mch_id && scene_obj.aid) {
		// 			options.aid = scene_obj.aid;
		// 		}
		// 	}
		// } else {
		// 	if (getApp().query !== null) {
		// 		var query = app.query;
		// 		getApp().query = null;
		// 		options.aid = query.aid;
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
							options.aid = res.data.rel_id
							activity_id = options.aid,
								this.loadData(options);
							setInterval(self.timeData, 1000)
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
			activity_id = options.aid;
			this.loadData(options);
			setInterval(self.timeData, 1000)
		}

		this.setData({
			role: getApp().core.getStorageSync('role')
		});
		// setTimeout(self.createImage, 2000)
	},
	changeNav: function(e) {


		var index = e.currentTarget.dataset.index


		var num = e.currentTarget.dataset.num
		let newCatArr = this.data.catsArr;
		newCatArr[num].checked = !newCatArr[num].checked;
		var newChooseIns = [];
		newCatArr.map((item, index) => {
			if (item.checked) {
				newChooseIns.push(item.id)
			}
		});


		// console.log(newChooseIns.join(','))
		this.setData({
			chooseIns: newChooseIns.join(','),
			cat_id: newChooseIns.join(','),
			priceDefault: true,
			catsArr: newCatArr
		})
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.default.active_list,
			data: {
				aid: activity_id,
				cat_id: this.data.chooseIns
			},
			success: function(res) {
				getApp().core.hideLoading()
				if (res.code == 0) {
					self.setData({
						goodList: res.data.page.goods,
						count: res.data.page.row_count,
						page: 1
					})
				}
			}
		})
	},
	// 获取滚动条当前位置
	scrolltoupper: function(e) {
		var self = this
		var top = e.detail.scrollTop
		var touchTop = top + 300
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
	goBack() {
		wx.navigateBack({
			delta: 1,
			fail: (res) => {
				wx.redirectTo({
					url: '/pages/index/index'
				})
			}
		});
	},
	openDescription: function() {
		var show = this.data.is_show
		this.setData({
			is_show: !show
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
	loadData: function(options) {
		self = this;
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.default.active_list,
			data: {
				aid: activity_id
			},
			success: function(res) {
				getApp().core.hideLoading()
				if (res.code == 0) {
					var catsArr = res.data.activity.cats
					var arr = []
					for (let i in catsArr) {
						var obj = {
							id: i,
							catsName: catsArr[i],
							checked: false
						}
						arr.push(obj)
					}
					self.setData({
						goodListMsg: res.data.activity,
						mrtj_sc: res.data.mrtj_sc,
						goodList: res.data.page.goods,
						catsArr: arr,
						count: res.data.page.row_count,
						total_count: res.data.page.row_count,
						invalid_areas: res.data.activity.invalid_areas,
						end_date: res.data.activity.end_date,
						start_data: res.data.activity.start_date
					})
					// var objKeys=Object.keys(catsArr);
					// console.log(objKeys.length);
					// var arr = []
					// for (var i=0;i<objKeys.length;i++) {
					// 	arr.id = 
					// }
					// wx.setNavigationBarTitle({
					// 	title: res.data.activity.name
					// })
					self.timeData()
				}
				if (res.code == 1) {
					wx.showModal({
						content: res.msg,
						icon: 'none',
						complete: function() {
							wx.redirectTo({
								url: '/pages/index/index'
							})
						}
					})
				}
			},
		})
	},
	// 倒计时
	timeData: function() {
		var self = this
		var end_date = self.data.end_date
		var start_data = self.data.start_data
		var now_date = parseInt(((new Date()).getTime()) / 1000)
		if (start_data - now_date > 0) {
			var time_date = start_data - now_date
			var sd, sh, sm;
			sd = Math.floor(time_date / 60 / 60 / 24);
			sh = Math.floor(time_date / 60 / 60 % 24);
			sm = Math.floor(time_date / 60 % 60);
			if (sd < 10) {
				sd = '0' + sd
			}
			if (sh < 10) {
				sh = '0' + sh
			}
			if (sm < 10) {
				sm = '0' + sm
			}
			if (sd >= '00' && sh >= '00' & sm >= '00')
				self.setData({
					sd: sd,
					sh: sh,
					sm: sm,
					kaishishi: true,
				})
		} else {
			var time_date = end_date - now_date
			var ed, eh, em;
			ed = Math.floor(time_date / 60 / 60 / 24);
			eh = Math.floor(time_date / 60 / 60 % 24);
			em = Math.floor(time_date / 60 % 60);
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
					daojishi: true,
				})
			}
		}
	},

	// 复制标题
	copyText: function(e) {
		var text = e.currentTarget.dataset.text
		wx.setClipboardData({
			data: text,
			success(res) {
				wx.getClipboardData({
					success(res) {

					}
				})
			}
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
	openChoose: function() {
		var self = this
		this.setData({
			chooseOpen: !self.data.chooseOpen
		})

	},
	closeChoose: function() {
		this.setData({
			chooseOpen: false
		})
	},
	chooseAll: function() {
		var self = this
		var catsArr = self.data.goodListMsg.cats
		var arr = []
		for (let i in catsArr) {
			var obj = {
				id: i,
				catsName: catsArr[i],
				checked: false
			}
			arr.push(obj)
		}
		self.setData({
			catsArr: arr,
			chooseIns: 0,
			cat_id: '',
			priceDefault: true,
			is_no_more: false
		})
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({

			url: getApp().api.default.active_list,
			data: {
				aid: activity_id
			},
			success: function(res) {
				getApp().core.hideLoading()
				if (res.code == 0) {
					self.setData({
						goodList: res.data.page.goods,
						count: res.data.page.row_count,
						page: 1
					})
				}
			}
		})
	}, //打开多选
	showChange: function() {

		this.setData({
			showChangeMore: true
		})
	}, //多选关闭
	showChange1: function() {

		this.setData({
			showChangeMore: !this.data.showChangeMore
		})
	}, //多选关闭
	closeChange: function() {
		this.setData({
			showChangeMore: false
		})
	},
	// 价格排序
	priceSort: function() {
		//多选关闭
		this.setData({
			showChangeMore: false
		})
		let self = this;
		var up = self.data.priceUp
		self.setData({
			priceDefault: false,
			discountDefault: true,
			priceUp: !up
		})
		getApp().core.showLoading({
			title: '加载中'
		})
		if (self.data.priceUp == true) {
			self.setData({
				sort: 'price',
				by: 'desc'
			})
			getApp().request({
				url: getApp().api.default.active_list,
				data: {
					aid: activity_id,
					cat_id: self.data.cat_id,
					sort: self.data.sort,
					by: self.data.by
				},
				success: function(res) {
					getApp().core.hideLoading()
					if (res.code == 0) {

						self.setData({
							goodList: res.data.page.goods,
							count: res.data.page.row_count,
							page: 1
						})
					};
				},
				complete: function() {

				}
			});
		} else {
			self.setData({
				sort: 'price',
				by: 'asc'
			})
			getApp().request({
				url: getApp().api.default.active_list,
				data: {
					aid: activity_id,
					cat_id: self.data.cat_id,
					sort: self.data.sort,
					by: self.data.by
				},
				success: function(res) {
					getApp().core.hideLoading()

					if (res.code == 0) {

						self.setData({
							goodList: res.data.page.goods,
							count: res.data.page.row_count,
							page: 1
						})
					};
				},
				complete: function() {

				}
			});
		}

	},
	onPageScroll: function(e) {
		var self = this;
		var top = e.scrollTop
		var touchTop = top + 300
		var customBar = self.data.customBar
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
		if (top <= customBar && !self.data.is_show_head) {
			self.setData({
				is_show_head: true,
			})
		}
		if (top > customBar && self.data.is_show_head && self.data) {
			// wx.pageScrollTo({
			// 	scrollTop: 5,
			// })
			self.setData({
				is_show_head: false,
			})
		}
	},
	showShare: function() {
		this.setData({
			isShowShare: true
		})
		this.shareModalClose()
		this.getAcitivityQrcode()
	},
	createImage: function() {
		var self = this
		var list = self.data.goodList
		var activityMsg = self.data.goodListMsg
		var activity_name = activityMsg.name
		var imgUrl = list[0].first_cover_pic
		var tmpprice = parseInt(list[0].price)
		// 手机适配
		var rpx = self.data.x / 375
		// 结束时间获取
		var endTime = new Date(self.data.end_date * 1000);
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

	},
	getAcitivityQrcode: function() {
		var self = this
		var list = self.data.goodListMsg.min_goods_info
		var activityMsg = self.data.goodListMsg
		var activity_name = activityMsg.name
		var imgUrl = list.first_cover_pic
		var tmpprice = list.price
		// 手机适配
		var rpx = self.data.x / 375
		// 结束时间获取
		var endTime = new Date(self.data.end_date * 1000);
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

		var data = {
			goods_pic: imgUrl,
			act_name: activity_name,
			price_str: tmpprice,
			end_date: show_end_time,
			activity: activity_id,
			sidFsShare: 1,
			page_url: 'pages/activity/activity'
		}
		getApp().request({
			url: getApp().api.default.activity_qrcode,
			data: data,
			success: function(res) {
				if (res.code == 0) {

					self.setData({
						qrcode_pic: res.data.pic_url
					})

				}
			}
		})
	},
	closeShare: function() {
		this.setData({
			isShowShare: false
		})
	},
	savePhotoThrottle: util.throttle(function() {
		this.savePhoto()
	}, 1000),
	savePhoto: function() {
		var self = this
		if (!self.data.qrcode_pic) {
			wx.showToast({
				title: '请等待图片加载完成~',
				duration: 2000,
				icon: 'none'
			})
			return
		}
		wx.getImageInfo({
			src: self.data.qrcode_pic,
			success(res) {
				wx.saveImageToPhotosAlbum({
					filePath: res.path,
					success(res) {
						wx.showModal({
							content: '图片已保存到相册，赶紧晒一下吧~',
							showCancel: false,
							confirmText: '知道了',
							confirmColor: '#72B9C3',
							success: function(res) {
								if (res.confirm) {

									self.setData({
										isShowShare: false
									})
								}
							},

						})
					},
					fail: function(res) {
						if (res.errMsg == 'saveImageToPhotosAlbum:fail auth deny') {
							wx.showToast({
								title: '请前往设置开启相册授权',
								duration: 2000,
								icon: 'none'
							})
						}
					}
				})
			}
		})
	},
	toSearch: function() {
		wx.navigateTo({
			url: '/pages/newSearch/newSearch'
		})
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},
	onReachBottom: function() {
		this.getMore()
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
				from: self.data.goods.from ? self.data.goods.from : '1'
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
					from: self.data.goods.from ? self.data.goods.from : '1'
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
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		this.getCartNum()
		gSpecificationsModel.init(this);
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
		this.setData({
			page: 1
		})
		self = this;
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.default.active_list,
			data: {
				aid: activity_id,
				cat_id: self.data.cat_id || '',
				page: 1
			},
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						goodListMsg: res.data.activity,
						goodList: res.data.page.goods,
						count: res.data.page.row_count,
						invalid_areas: res.data.activity.invalid_areas,
						sort: '',
						by: '',
						discountDefault: true,
						priceDefault: true,
						is_no_more: false
					})
				}
			},
			complete: function() {
				getApp().core.hideLoading()
				getApp().core.stopPullDownRefresh();
			}
		})
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	getMore: function() {

		var self = this;
		var page = self.data.page
		if (self.data.goodList.length < self.data.count) {
			++page
			self.setData({
				page: page,
				is_top: true
			})
		} else {
			self.setData({
				is_no_more: true
			})
			return
		}

		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.default.active_list,
			data: {
				aid: activity_id,
				cat_id: self.data.cat_id,
				sort: self.data.sort || '',
				by: self.data.by || '',
				page: page

			},
			success: function(res) {
				getApp().core.hideLoading()
				if (res.code == 0) {
					var newGoodList = res.data.page.goods
					var nowGoodList = self.data.goodList.concat(newGoodList)
					self.setData({

						goodList: nowGoodList,

					})
				}
			}
		})
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function(res) {
		var self = this
		var title = self.data.goodListMsg.name
		if (res.from === 'button') {
			// 来自页面内转发按钮
			this.shareModalClose()
		}
		return getApp().page.onShareQp(this, 'aid=' + activity_id, title);
	}
})
