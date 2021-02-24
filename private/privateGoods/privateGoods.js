// pages//private/privateGoods/privateGoods.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		cardCur: 0,
		swiperList: [],
		dotStyle: false,
		towerStart: 0,
		direction: '',
		goods_num: 0,
		pageType: 'STORE',
		share_modal_active: '',
		goods_qrcode_active: '',
		isReturn: true
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		if (getApp().core.getStorageSync('USER_INFO')) {
			this.setData({
				is_login: false,
				role: getApp().core.getStorageSync('role'),
			})
		} else {
			this.setData({
				is_login: true
			})
		}
		getApp().page.onLoad(this, options);
		var pages = getCurrentPages();
		var prevPage = pages.length > 1 ? true : false;
		if (!prevPage) {
			this.setData({
				isReturn: false
			})
		}
		this.getGoodsData(options.id)
	},
	back:function () {
		var self = this
		wx.navigateBack()
	},
	toHome: function () {
		var self = this
		wx.redirectTo({
			url:'/pages/index/index'
		})
	},
	getGoodsData(id) {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_goods_data,
			data: {
				
				id: id
			},
			success(res) {
				if (res.code == 0) {
					self.setData(res.data)
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
						
					})
				}
	
			}
		})
	},
	addCart () {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.edit_cart,
			data: {
				
				num: self.data.goods_num + 1,
				goods_id: self.data.id,
				price: self.data.min_price
			},
			success(res) {
				if (res.code == 0) {
					wx.showToast({
						title: '加入购物车成功',
						icon: 'none'
					})
					self.setData({
						goods_num: self.data.goods_num + 1
					})
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			}
		})
	},
	buyNow () {
		var self = this
		var goods_id = self.data.id
		var goods_name = self.data.name
		var goods_price = self.data.min_price
		var goods_pic = self.data.cover_pic[0]
		var num = 1
		if (self.data.num > 0) {
			wx.navigateTo({
				url: '/private/privateBasket/privateBasket?type=2&goods_id=' + goods_id + '&num=' + num + '&goods_name=' + goods_name +'&goods_price=' + goods_price + '&goods_pic=' + goods_pic
			})
		} else {
			wx.showToast({
				title: '库存不足',
				icon: 'none'
			})
		}
	},
	downMaterial: function () {
		var self = this;
		var picList = self.data.cover_pic
		for (var i in picList) {
			wx.downloadFile({
				url: picList[i],
				success(res) {
					if (res.statusCode === 200) {
						wx.saveImageToPhotosAlbum({
							filePath: res.tempFilePath,
							success: function(res) {
								wx.showToast({
									title: '保存成功！',
								})
							},
							fail(res) {
								wx.showToast({
									title: '保存失败！',
								})
							}
						})
					}
				}
			})
		}
	},
	getQrcode() {
		getApp().request({
			url: getApp().api.selfSupport.qrcode,
			data: {
				
				type: 'goods',
				goods_id: this.data.id
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
	showShareModal: function () {
	    var self = this;
		var token = getApp().core.getStorageSync('ACCESS_TOKEN')
		if (!token) {
			self.setData({
				showGetLogin: true,
				user_info_show: true,
			})
			return
		}
	    self.setData({
	        share_modal_active: "active",
			is_commission: false,
	        no_scroll: true,
	    });
		self.getSharePic();
	},
	shareModalClose: function () {
	    var self = this;
	    self.setData({
	        share_modal_active: "",
	        no_scroll: false,
			is_commission: true,
	    });
	},
	getSharePic: function () {
		var self = this;
		var goods = self.data.goods
		getApp().core.showLoading({
			title:'加载中'
		})
		getApp().request({
			url: getApp().api.selfSupport.share_goods_qrcode,
			data: {
				
				goods_id: self.data.id,
				type: 'goods'
			},
			success: function (res) {
				if(res.code==0) {
					getApp().core.hideLoading()
					self.setData({
						sharePic: res.data.pic_url
					})
				}
				if (res.code==1) {
					getApp().core.hideLoading()
					wx.showToast({
						title:'卡片图片获取失败，请稍后再试',
						duration: 2500,
						icon: 'none'
					})
					self.setData({
						is_commission: true
					})
				}
			},
			fail: function () {
				getApp().core.hideLoading()
				wx.showToast({
					title:'网络错误，请稍后再试',
					duration: 2500,
					icon: 'none',
				})
				self.setData({
					is_commission: true
				})
			}
		})
	},
	getGoodsQrcode: function () {
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
	goodsQrcodeClose: function () {
	    var self = this;
	    self.setData({
	        goods_qrcode_active: "",
	        no_scroll: false,
	    });
	},
	
	saveGoodsQrcode: function () {
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
	        success: function (e) {
	            getApp().core.showLoading({
	                title: "正在保存图片",
	                mask: false,
	            });
	            getApp().core.saveImageToPhotosAlbum({
	                filePath: e.tempFilePath,
	                success: function () {
	                    getApp().core.showModal({
	                        title: '提示',
	                        content: '商品海报保存成功',
	                        showCancel: false,
	                    });
	                },
	                fail: function (e) {
	                    getApp().core.showModal({
	                        title: '图片保存失败',
	                        content: e.errMsg,
	                        showCancel: false,
	                    });
	                },
	                complete: function (e) {
	                    getApp().core.hideLoading();
	                }
	            });
	        },
	        fail: function (e) {
	            getApp().core.showModal({
	                title: '图片下载失败',
	                content: e.errMsg + ";" + self.data.goods_qrcode,
	                showCancel: false,
	            });
	        },
	        complete: function (e) {
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

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

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
					path: "/private/privateGoods/privateGoods?id=" + self.data.id + "&user_id=" + user_info.id + "&mch_id=" + mch_info.id,
					title: self.data.name,
					imageUrl: self.data.sharePic,
				};
				break;
			case 'menu':
				var res = {
					path: "/private/privateGoods/privateGoods?id=" + self.data.id + "&user_id=" + user_info.id + "&mch_id=" + mch_info.id,
					title: self.data.name,
					imageUrl: self.data.cover_pic[0],
				}
				break;
			default:
				break;
		}
		self.shareModalClose()
		return res;
	}
})
