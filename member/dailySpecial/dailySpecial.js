// pages/dailySpecial/dailySpecial.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		y: getApp().core.getSystemInfoSync().windowHeight,
		navTab: [],
		classifyList: [],
		navIns: 1,
		classifyIns: 1,
		// type_id: 2,
		page: 1,
		isShowShare: false,
		is_classify: true,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {

		// var dailyClassify = getApp().core.getStorageSync('dailyClassify')
		// if (dailyClassify) {
		// 	this.setData({
		// 		dailyClassify: dailyClassify,
		// 		navIns: dailyClassify,
		// 		type_id: dailyClassify + 1,
		// 	})
		// }
		// this.getTypeList()
		this.getDailyList()
	},
	changeClassify: function(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		self.setData({
			classifyIns: index
		})
	},
	// saveClassify: function() {
	// 	var self = this
	// 	wx.showModal({
	// 		content: '是否保存',
	// 		success: function(res) {
	// 			if (res.confirm) {
	// 				getApp().core.setStorageSync('dailyClassify', self.data.classifyIns)
	// 				self.setData({
	// 					navIns: self.data.classifyIns,
	// 					type_id: self.data.classifyIns + 1,
	// 				})
	// 				self.getDailyList()
	// 				self.closeClassify()
	// 			}
	// 		}
	// 	})

	// },
	// closeClassify: function() {
	// 	this.setData({
	// 		is_classify: false
	// 	})
	// },
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
	// getTypeList: function() {
	// 	var self = this
	// 	getApp().request({
	// 		url: getApp().api.mch.daily_type_list,
	// 		data: {
	// 			userId: getApp().core.getStorageSync('USER_INFO').id
	// 		},
	// 		success: function(res) {
	// 			if (res.code == 0) {
	// 				self.setData({
	// 					navTab: res.data,
	// 					type_id: res.data[0].id
	// 				})
	// 				self.getDailyList(res.data[0].id)
	// 			} else {
	// 				wx.showToast({
	// 					title: res.msg,
	// 					icon: 'none',
	// 					duration: 2000
	// 				})
	// 			}
	// 		}
	// 	})
	// },
	// getTypeList: function() {
	// 	var self = this
	// 	getApp().request({
	// 		url: getApp().api.mch.get_price_section,
	// 		data: {
	// 			userId: getApp().core.getStorageSync('USER_INFO').id
	// 		},
	// 		success: function(res) {
	// 			if (res.code == 0) {
	// 				self.setData({
	// 					navTab: res.data,
	// 					classifyList: res.data
	// 				})
	// 			} else {
	// 				wx.showToast({
	// 					title: res.msg,
	// 					icon: 'none',
	// 					duration: 2000
	// 				})
	// 			}
	// 		}
	// 	})
	// },
	getDailyList: function(id) {
		var self = this
		getApp().request({
			url: getApp().api.mch.daily_info_list,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				// type: self.data.type_id || id
				// price_section: self.data.type_id || 1
			},
			success: function(res) {
				if (res.code == 0) {
					self.setData({
						dailyList: res.data.list
					})
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none',
						duration: 2000
					})
				}
			},
			complete: function() {
				getApp().core.stopPullDownRefresh();
			}
		})
	},
	toRecommend: function(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var gid = e.currentTarget.dataset.gid
		var name = e.currentTarget.dataset.gn
		var goods = {}
		var text = e.currentTarget.dataset.text
		var picList = e.currentTarget.dataset.pic
		goods.first_cover_pic = e.currentTarget.dataset.gpic
		goods.original_price = e.currentTarget.dataset.go
		goods.price = e.currentTarget.dataset.gp
		goods.id = e.currentTarget.dataset.gid
		self.setData({
			share_modal_active: "active",
			type: 'goods',
			gid: gid,
			gname: name,
			shareIndex: index,
			shareId: id,
			shareText: text,
			sharePicList: picList,
			no_scroll: true,
		})
		self.getSharePic(goods);
	},
	toRecommend1: function(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var aid = e.currentTarget.dataset.aid
		var text = e.currentTarget.dataset.text
		var picList = e.currentTarget.dataset.pic
		var name = e.currentTarget.dataset.an
		var activity = {}
		activity.first_cover_pic = e.currentTarget.dataset.apic
		activity.name = e.currentTarget.dataset.an
		activity.price = e.currentTarget.dataset.ap
		activity.id = e.currentTarget.dataset.aid
		activity.end = e.currentTarget.dataset.ae
		self.setData({
			share_modal_active: "active",
			aid: aid,
			apic: activity.first_cover_pic,
			type: 'activity',
			sharePic: '1',
			activity: activity,
			aname: name,
			shareIndex: index,
			shareId: id,
			shareText: text,
			sharePicList: picList,
			no_scroll: true,
		})
	},
	// getAcitivityQrcode: function(activity) {
	// 	var self = this
	// 	var data = {
	// 		goods_pic: activity.first_cover_pic,
	// 		act_name: activity.name,
	// 		price_str: activity.price,
	// 		end_date: activity.end,
	// 		activity: activity.id
	// 	}
	// 	getApp().request({
	// 		url: getApp().api.default.activity_qrcode,
	// 		data: data,
	// 		success: function(res) {
	// 			if (res.code == 0) {

	// 				self.setData({
	// 					qrcode_pic: res.data.pic_url
	// 				})

	// 			}
	// 		}
	// 	})
	// },
	getSharePic: function(goods) {
		var self = this
		var goods = goods
		getApp().core.showLoading({
			title: '加载中'
		})
		getApp().request({
			url: getApp().api.default.get_share_pic,
			data: {
				attr_pic: goods.first_cover_pic,
				price: goods.original_price,
				sale_price: goods.price,
				id: goods.id,
				route_type: 'dailySpecial'
			},
			success: function(res) {
				if (res.code == 0) {
					getApp().core.hideLoading()
					self.setData({
						sharePic: res.data.pic_url
					})
				}
				if (res.code == 1) {
					getApp().core.hideLoading()
					wx.showToast({
						title: '卡片图片获取失败，请稍后再试',
						duration: 2500,
						icon: 'none'
					})
				}
			},
			fail: function() {
				getApp().core.hideLoading()
				wx.showToast({
					title: '网络错误，请稍后再试',
					duration: 2500,
					icon: 'none',
				})
			}
		})
	},
	getGoodsQrcode: function() {
		var self = this
		self.setData({
			goods_qrcode_active: "active",
			share_modal_active: "",
		});
		if (self.data.type == 'goods') {
			getApp().request({
				url: getApp().api.default.goods_qrcode,
				data: {
					goods_id: self.data.gid,
				},
				success: function(res) {
					if (res.code == 0) {
						self.setData({
							goods_qrcode: res.data.pic_url,
						});
						self.savePicText()
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
		}
		if (self.data.type == 'activity') {
			var activity = self.data.activity
			var data = {
				goods_pic: activity.first_cover_pic,
				act_name: activity.name,
				price_str: activity.price,
				end_date: activity.end,
				activity: activity.id
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
		}

	},
	goodsQrcodeClose: function() {
		var self = this
		self.setData({
			goods_qrcode_active: "",
			no_scroll: false,
		});
	},
	saveGoodsQrcode: function() {
		var self = this
		var type = ''
		if (self.data.type == 'goods') {
			type = 'goods'
			var pic_url = self.data.goods_qrcode
		}
		if (self.data.type == 'activity') {
			type = 'activity'
			var pic_url = self.data.qrcode_pic
		}
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
							success(res) {
								if(res.confirm) {
									self.goodsQrcodeClose()
								}
							}
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
	sbumitShare: function() {
		var self = this
		var index = self.data.shareIndex
		getApp().request({
			url: getApp().api.mch.daily_info_share,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				id: self.data.shareId
			},
			success: function(res) {
				if (res.code == 0) {
					// wx.showToast({
					// 	title: res.msg,
					// 	icon: 'none',
					// 	duration: 2000
					// })
					self.setData({
						['dailyList[' + index + '].infoCircleShare']: true
					})
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none',
						duration: 2000
					})
				}
			}
		})
	},
	// 预览图片 
	previewImage: function(e) {
		var self = this
		var picUrl = e.currentTarget.dataset.url
		var picList = e.currentTarget.dataset.list
		wx.previewImage({
			current: picUrl, // 当前显示图片的http链接
			urls: picList // 需要预览的图片http链接列表
		})

	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},
	changeTab: function(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		var type_id = e.currentTarget.dataset.id
		self.setData({
			navIns: index,
			type_id: type_id
		})
		self.getDailyList()
	},
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
	savePicText: function(e) {
		var self = this
		var picList = []
		if (e) {
			var text = e.currentTarget.dataset.text
			// picList = e.currentTarget.dataset.pic
		} else {
			var text = self.data.shareText
			// picList = self.data.sharePicList
		}
		// text = text.replace(/<(\/p|\/div)*>/i, "\r\n");
		// text = text.replace(/<(\/p|\/div)>/i, "\r\n");
		// console.log(text);
		// text = text.replace(/<[^>]*>/i, "");
		// console.log(text);
		// text = text.replace(/<[^>]*>/i, "");
		// console.log(text);
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
		wx.setClipboardData({
			data: text,
			success(res) {
				wx.showToast({
					title: '内容已复制，快去微信粘贴吧～',
					duration: 3000,
					icon: 'none'
				})
				wx.getClipboardData({
					success(res) {

					}
				})
			}
		})
		// for (var i in picList) {
		// 	wx.downloadFile({
		// 		url: picList[i],
		// 		success(res) {
		// 			if (res.statusCode === 200) {
		// 				wx.saveImageToPhotosAlbum({
		// 					filePath: res.tempFilePath,
		// 					success: function(res) {
		// 						wx.showToast({
		// 							title: '保存成功！',
		// 							icon: 'none'
		// 						})

		// 					},
		// 					fail(res) {
		// 						wx.showToast({
		// 							title: '保存失败！',
		// 							icon: 'none'
		// 						})
		// 					}
		// 				})
		// 			}
		// 		}
		// 	})
		// }
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
		this.setData({
			page: 1,
			is_no_more: false,
			stopLoadMore: false,
		})
		this.getDailyList()
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {
		var self = this
		
		var page = self.data.page
		var index = page
		var data = {
			userId: getApp().core.getStorageSync('USER_INFO').id,
			// type: self.data.type_id,
			// price_section: self.data.type_id || 1
		}
		var url = getApp().api.mch.daily_info_list
		getApp().core.pading(self, url, data, function(res) {
			if (res.data.list.length == 0) {
				self.setData({
					stopLoadMore: true,
					is_no_more: true
				})
				return
			}
			var newGoodList = res.data.list
			var nowGoodList = self.data.dailyList.concat(newGoodList)
			self.setData({

				dailyList: nowGoodList,

			})
		})
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function(e) {
		var self = this
		var type = self.data.type
		var shareType = e.target.dataset.type
		self.shareModalClose()
		self.sbumitShare()
		if (type == 'goods') {
			if (shareType == 1) {
				self.savePicText()
			}
			var user_info = getApp().getUser();
			var mch_info = wx.getStorageSync('_mchInfo');
			var res = {
				path: "/pages/goods/goods?id=" + self.data.gid + "&user_id=" + user_info.id + "&mch_id=" + mch_info.id,
				title: self.data.gname,
				imageUrl: self.data.sharePic,
			};
			return res;
		}
		if (type == "activity") {
			if (shareType == 1) {
				self.savePicText()
			}
			var user_info = getApp().getUser();
			var mch_info = wx.getStorageSync('_mchInfo');
			var res = {
				path: "/pages/activity/activity?aid=" + self.data.aid + "&user_id=" + user_info.id + "&mch_id=" + mch_info.id,
				title: self.data.aname,
				imageUrl: self.data.apic,
			};
			return res;
		}

	}
})
