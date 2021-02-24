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
		type:1,//1开始  2预告
		pageType: 'normal',
		pageTop: 'normal',
		is_top: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var self = this
		getApp().page.onLoad(this, options);
		toTop.init(this)
		if (options) {
			
			this.setData({
				chooseIns: options.cat_id,
				cat_id: options.cat_id,
				act_bg: options.waiting==2?getApp().core.getStorageSync('_img').activity_start:getApp().core.getStorageSync('_img').act,
				type:options.waiting,
			})
		}
		this.getCatList()
		this.getActivityFilter()

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
	changeNav(e) {
		var index = e.currentTarget.dataset.index
		this.setData({
			chooseIns: index,
			cat_id: index,
			page: 1,
			stopLoadMore: false,
			is_no_more: false
		})
		this.getActivityFilter()
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
	getCatList: function() {
		var self = this
		getApp().core.showLoading({
			title: '加载中',
		});
		getApp().request({
			url: getApp().api.default.walk_old_cats,
			success: function(res) {
				if (res.code == 0) {
					getApp().core.hideLoading();
					res.data.shift()
					self.setData({
						catalog: res.data,
					})
				}
			},
			fail: function() {},
			complete: function() {
				getApp().core.stopPullDownRefresh();
			}
		})
	},
	getActivityFilter: function() {
		var self = this
		getApp().core.showLoading({
			title: '加载中',
		});
		// var page = self.data.page
		// page++
		// self.setData({
		// 	page:page
		// })
		getApp().request({
			url: getApp().api.default.walk_active_list,
			data: {
				cat_ids: self.data.cat_id || '',
				type: this.data.type == 2? 2:1 ,
				is_home: this.data.type == 3? 2:'',
			},
			success: function(res) {
				if (res.code == 0) {
					getApp().core.hideLoading();
					self.setData({
						list: res.data.data
					})
				}
			},
			complete: function() {

				getApp().core.stopPullDownRefresh();
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
	showShare: function() {
		this.setData({
			isShowShare: true
		})
		this.shareModalClose()
		this.getAcitivityQrcode()
	},
	getAcitivityQrcode: function() {
		var self = this
		getApp().request({
			url: getApp().api.default.get_act_collect_pic,
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
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		// this.getCartNum()
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
			page: 1,
			stopLoadMore: false,
			is_no_more: false
		})
		this.getActivityFilter()
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	getMore: function() {

		var self = this

		var page = self.data.page
		var index = page
		var data = {
			cat_ids: self.data.cat_id,
			type:this.data.type
		}
		var url = getApp().api.default.walk_active_list
		getApp().core.pading(self, url, data, function(res, index) {
			wx.hideLoading()
			if (res.data.length == 0) {
				self.setData({
					stopLoadMore: true,
					is_no_more: true
				})
				return
			}
			var newActList = res.data.data
			var nowActList = self.data.list.concat(newActList)
			self.setData({
				list: nowActList,
				loadingSwitch: true
			})
		})
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function(res) {
		var self = this
		var title = '活动推荐'
		var cat_id = self.data.cat_id
		if (res.from === 'button') {
			// 来自页面内转发按钮
			this.shareModalClose()
		}
		return getApp().page.onShareQp(this, 'cat_id=' + cat_id, title);
	}
})
