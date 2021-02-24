// member/recommendMaterial/recommendMaterial.js
var shareWay = require('../../components/share/share.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		pageType: 'normal',
		share_type: 'code',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		shareWay.init(this);
		this.setData({
			id: options.id
		})
		this.getData()
	},
	handleLongPress() {
		console.log('复制');
	},
	getData() {
		getApp().request({
			url: getApp().api.default.get_material,
			data: {
				id: this.data.id
			},
			success: (res) => {
				if(res.code == 0) {
					this.setData({
						materialInfo: res.data
					})
					var type = res.data[0].out_type
					if (type == 2) {
						this.loadData()
					}
				}
			}
		})
	},
	// 复制文字
	copyText: function(e) {
		var text = e.currentTarget.dataset.text
		while (text.indexOf('<p>') > -1) {
			text = text.replace('<p>', '')
			text = text.replace('</p>', '\n')
		}
		
		while (text.indexOf('<br/>') > -1) {
			text = text.replace('<br/>', '\n')
		}
		while (text.indexOf('&npsb') > -1) {
			text = text.replace('&npsb', ' ')
		}
		while (text.indexOf('<em>') > -1) {
			text = text.replace('<em>', '')
			text = text.replace('</em>', '')
		}
		while (text.indexOf('<strong>') > -1) {
			text = text.replace('<strong>', '')
			text = text.replace('</strong>', '')
		}
		while (text.indexOf('<span ') > -1) {
			text = text.replace(/<[^>]*>/i, '')
			text = text.replace('</span>', '')
		}
		while (text.indexOf('&nbsp;') > -1) {
			text = text.replace('&nbsp;', ' ')
		}
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
	previewPic(e) {
		console.log(e);
		var picList = e.currentTarget.dataset.pics
		var pic = e.currentTarget.dataset.pic
		wx.previewImage({
			urls: picList,
			current: pic
		})
	},
	// 保存素材
	saveMaterial(e) {
		var type = e.currentTarget.dataset.type
		if (type == 1) {
			var picList = e.currentTarget.dataset.pic
			for (var i in picList) {
				wx.downloadFile({
					url: picList[i],
					success(res) {
						if (res.statusCode === 200) {
							// 保存内容为图片
							if (true) {
								wx.saveImageToPhotosAlbum({
									filePath: res.tempFilePath,
									success: function(res) {
										wx.showToast({
											title: '保存成功！',
											icon: 'none'
										})
								
									},
									fail(res) {
										wx.showToast({
											title: '保存失败！',
											icon: 'none'
										})
									}
								})
							}
						}
					}
				})
			}
		} 
		if (type == 2) {
			var video = e.currentTarget.dataset.video
			wx.downloadFile({
				url: video,
				success(res) {
					if (res.statusCode === 200) {
						// 保存内容为图片
						if (true) {
							wx.saveVideoToPhotosAlbum({
							  filePath: res.tempFilePath,
							  success: function(res) {
							  	wx.showToast({
							  		title: '保存成功！',
							  		icon: 'none'
							  	})
							  						
							  },
							  fail(res) {
							  	wx.showToast({
							  		title: '保存失败！',
							  		icon: 'none'
							  	})
							  }
							})
						}
					}
				},
				fail(res) {
					console.log(res);
				}
				
			})
		}
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
		if (self.data.materialInfo[0].out_type == 1) {
			this.getQrcodeGoods()
		} else {
			this.getQrcode()
		}
		
	},
	getQrcodeGoods() {
		var self = this
		var data = {
			goods_id: self.data.materialInfo[0].out_id,
			sidFsShare: 1
		}
		getApp().request({
			url: getApp().api.default.goods_qrcode,
			data: data,
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						goods_qrcode: res.data.pic_url,
					});
				}
				if (res.code == 1) {
					self.goodsQrcodeClose();
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
			},
		});
	},
	getQrcode: function() {
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
			activity: self.data.materialInfo[0].out_id,
			sidFsShare: 1
		}
		getApp().request({
			url: getApp().api.default.activity_qrcode,
			data: data,
			success: function(res) {
				if (res.code == 0) {
	
					self.setData({
						goods_qrcode: res.data.pic_url
					})
	
				}
			}
		})
	},
	// getQrcode() {
	// 	var self = this
	// 	var list = self.data.brand.min_goods_info
	// 	var activityMsg = self.data.brand
	// 	var activity_name = activityMsg.name
	// 	var imgUrl = list.first_cover_pic
	// 	var tmpprice = list.price
	// 	// 结束时间获取

	// 	var data = {
	// 		goods_pic: imgUrl,
	// 		act_name: activity_name,
	// 		price_str: tmpprice,
	// 		activity: self.data.brand_id,
	// 		page_url: 'pages/brand/brand',
	// 		sidFsShare: 1
	// 	}
	// 	getApp().request({
	// 		url: getApp().api.default.activity_qrcode,
	// 		data: data,
	// 		success: function(res) {
	// 			if (res.code == 0) {

	// 				self.setData({
	// 					goods_qrcode: res.data.pic_url
	// 				})

	// 			}
	// 		}
	// 	})
	// },
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
	loadData: function(options) {
		self = this;
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.default.active_list,
			data: {
				aid: self.data.materialInfo[0].out_id
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

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function(res) {
		var self = this;
		var user_info = getApp().core.getStorageSync(getApp().const.USER_INFO);
		var mch_id = wx.getStorageSync('_mchInfo').id;
		if (self.data.materialInfo[0].out_type == 1) {
			var res = {
				path: "/pages/goods/goods?id=" + self.data.materialInfo[0].out_id  + "&user_id=" + user_info.id +
					"&mch_id=" + mch_id,
				title: self.data.materialInfo[0].brand_name,
				imageUrl: self.data.materialInfo[0].brand_img,
			}
		} else {
			
			var res = {
				path: "/pages/activity/activity?aid=" + self.data.materialInfo[0].out_id  + "&user_id=" + user_info.id +
					"&mch_id=" + mch_id,
				title: self.data.materialInfo[0].brand_name,
				imageUrl: self.data.materialInfo[0].brand_img,
			}
		}
		return res;
		
	}
})
