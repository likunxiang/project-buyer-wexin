// pages//private/privateAddGoods/privateAddGoods.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		picList: [],
		detailPicList: [],
		is_classify: false,
		classifyList: [],
		showClassify: [],
		showClassifyId: [],
		showTips: [],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {

		if (options.id) {
			this.getGoodsData(options.id)
			wx.setNavigationBarTitle({
				title: '编辑商品'
			})
		}
		this.getTag()
	},
	getTag() {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_tag,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id
			},
			success(res) {
				var tipsList = []

				for (var i in res.data) {
					var obj = {}
					obj.name = res.data[i]
					obj.isChoose = false
					tipsList.push(obj)
				}
				if (self.data.showTips && self.data.showTips.length > 0) {
					var showTips = self.data.showTips
					for (var i in showTips) {
						var tips = showTips[i]
						for (var j in tipsList) {
							if (tipsList[j].name.indexOf(tips) > -1) {
								tipsList[j].isChoose = true
							}
						}
					}
				}
				self.setData({
					tipsList: tipsList
				})

			}
		})
	},
	getCatList() {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_cat_list,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success(res) {
				if (res.code == 0) {
					var classifyList = res.data
					for (var i in res.data) {
						classifyList[i].isChoose = false
					}
					if (self.data.showClassify && self.data.showClassify.length > 0) {
						var showClassify = self.data.showClassify
						for (var i in showClassify) {
							var tips = showClassify[i]
							for (var j in classifyList) {
								if (classifyList[j].name.indexOf(tips) > -1) {
									classifyList[j].isChoose = true
								}
							}
						}
					}
					self.setData({
						classifyList: classifyList
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
	getGoodsData(id) {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_goods_data,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				id: id
			},
			success(res) {
				if (res.code == 0) {
					var goods = res.data
					var showClassify = []
					var showClassifyId = []
					var picList = []
					var detailPicList = []
					for (var i in goods.cat) {
						showClassify.push(goods.cat[i].name)
						showClassifyId.push(goods.cat[i].id)
					}
					for (var j in goods.cover_pic) {
						wx.downloadFile({
							url: goods.cover_pic[j],
							success(res) {
								if (res.statusCode === 200) {
									picList.push(res.tempFilePath)
									self.setData({
										picList: picList
									})
								}
							}
						})
					}
					if (goods.cover_pic_detail) {
						for (var x in goods.cover_pic_detail) {
							wx.downloadFile({
								url: goods.cover_pic_detail[x],
								success(res) {
									if (res.statusCode === 200) {
										detailPicList.push(res.tempFilePath)
										self.setData({
											detailPicList: detailPicList
										})
									}
								}
							})
						}
					}

					self.setData({
						goodsName: goods.name,
						goodsDesc: goods.desc,
						showTips: goods.tag,
						showClassify: showClassify,
						showClassifyId: showClassifyId,
						goodsPrice: goods.min_price,
						goodsNum: goods.num,
						id: id
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
	upPic() {
		var self = this
		var picList = self.data.picList
		wx.chooseImage({
			success(res) {
				var tempPic = res.tempFilePaths
				self.setData({
					picList: picList.concat(tempPic)
				})
			}
		})
	},
	upDetailPic() {
		var self = this
		var detailPicList = self.data.detailPicList
		wx.chooseImage({
			success(res) {
				var tempPic = res.tempFilePaths
				self.setData({
					detailPicList: detailPicList.concat(tempPic)
				})
			}
		})
	},
	getGoodsName(e) {
		this.setData({
			goodsName: e.detail.value
		})
	},
	getGoodsDesc(e) {
		this.setData({
			goodsDesc: e.detail.value,
			is_input: false,
			focus: false
		})
	},
	getGoodsPrice(e) {
		this.setData({
			goodsPrice: e.detail.value
		})
	},
	getGoodsNum(e) {
		this.setData({
			goodsNum: e.detail.value
		})
	},
	inputText() {
		this.setData({
			is_input: true,
			focus: true
		})
	},
	// 商品分类
	chooseClassify(e) {
		var self = this
		var text = e.currentTarget.dataset.text
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var showClassify = self.data.showClassify
		var showClassifyId = self.data.showClassifyId
		var classifyList = self.data.classifyList

		if (showClassify.indexOf(text) > -1) {
			var showIndex = showClassify.indexOf(text)
			showClassify.splice(showIndex, 1)
			showClassifyId.splice(showIndex, 1)
			self.setData({
				['classifyList[' + index + '].isChoose']: false,
				showClassify: showClassify,
				showClassifyId: showClassifyId
			})
		} else {
			if (showClassify.length < 3) {
				showClassify.push(text)
				showClassifyId.push(id)
				self.setData({
					['classifyList[' + index + '].isChoose']: true,
					showClassify: showClassify,
					showClassifyId: showClassifyId
				})
			} else {
				wx.showToast({
					title: '最多只能选三个分类',
					icon: 'none',
				})
			}

		}


	},
	saveClassify() {
		this.closeClassify()
	},
	cancelClassify() {
		this.closeClassify()
	},
	inputTips(e) {
		var tipsValue = e.detail.value
		this.setData({
			tipsValue: tipsValue
		})
	},
	// 标签分类
	chooseTips(e) {
		var self = this
		var text = e.currentTarget.dataset.text
		var index = e.currentTarget.dataset.index
		var showTips = self.data.showTips
		var tipsList = self.data.tipsList

		if (showTips.indexOf(text) > -1) {
			var showIndex = showTips.indexOf(text)
			showTips.splice(showIndex, 1)
			self.setData({
				['tipsList[' + index + '].isChoose']: false,
				showTips: showTips
			})
		} else {
			if (showTips.length < 2) {
				showTips.push(text)
				self.setData({
					['tipsList[' + index + '].isChoose']: true,
					showTips: showTips
				})
			} else {
				wx.showToast({
					title: '最多只能选两个标签',
					icon: 'none',
				})
			}

		}


	},
	saveTips() {

		var showTips = this.data.showTips
		if (showTips.length <= 2) {
			this.closetips()
			if (this.data.tipsValue) {
				showTips.push(this.data.tipsValue)
				this.setData({
					showTips: showTips
				})
			}
		} else {
			wx.showToast({
				title: '最多只能选两个标签',
				icon: 'none',
			})
		}


	},
	cancelTips() {
		this.closetips()
	},
	stop() {
		return
	},
	viewPic(e) {
		var self = this
		var url = e.currentTarget.dataset.url
		wx.previewImage({
			urls: self.data.picList,
			current: url
		})
	},
	delPic(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		var picList = self.data.picList
		picList.splice(index, 1)
		self.setData({
			picList: picList
		})
	},
	openClassify() {
		this.setData({
			is_classify: true
		})
	},
	closeClassify() {
		this.setData({
			is_classify: false
		})
	},
	opentips() {
		var tipsValue = this.data.tipsValue
		var showTips = this.data.showTips

		if (tipsValue) {
			var showIndex = showTips.indexOf(tipsValue)
			showTips.splice(showIndex, 1)
			this.setData({
				showTips: showTips
			})
		}
		this.setData({
			is_tips: true,
			tipsValue: ''
		})
	},
	closetips() {
		this.setData({
			is_tips: false
		})
	},
	submitGoods(e) {
		var self = this
		var status = e.currentTarget.dataset.status
		var pic_complete_count = 0
		var pic_url_list = []
		var dpic_complete_count = 0
		var dpic_url_list = []
		if (self.data.picList.length > 0) {
			getApp().core.showLoading({
				title: "正在上传图片",
				mask: true,
			});
			for (var i in self.data.picList) {
				(function(i) {
					getApp().core.upFile({
						url: getApp().api.selfSupport.upload_image,
						filePath: self.data.picList[i],
						name: "image",
						success: function(res) {},
						complete: function(res) {

							pic_complete_count++;
							if (res.statusCode == 200) {
								res = JSON.parse(res.data);
								if (res.code == 0) {
									pic_url_list[i] = res.data.image;
								}
							}
							if (pic_complete_count == self.data.picList.length) {
								if (self.data.detailPicList.length > 0) {
									for (var j in self.data.detailPicList) {
										(function(j) {
											getApp().core.upFile({
												url: getApp().api.selfSupport.upload_image,
												filePath: self.data.detailPicList[j],
												name: "image",
												success: function(res) {},
												complete: function(res) {

													dpic_complete_count++;
													if (res.statusCode == 200) {
														res = JSON.parse(res.data);
														if (res.code == 0) {
															dpic_url_list[j] = res.data.image;
														}
													}
													if (dpic_complete_count == self.data.detailPicList.length) {
														getApp().core.hideLoading();
														_submit()
													}
												}
											});
										})(j);
									}
								} else {
									getApp().core.hideLoading();
									_submit()
								}
							}
						}
					});
				})(i);
			}
		} else {
			_submit()
		}

		function _submit() {
			getApp().request({
				url: getApp().api.selfSupport.edit_goods,
				method: 'POST',
				data: {
					userId: getApp().core.getStorageSync('USER_INFO').id,
					id: self.data.id || '',
					cat_id: self.data.showClassifyId,
					status: status,
					name: self.data.goodsName || '',
					cover_pic: pic_url_list,
					cover_pic_detail: dpic_url_list,
					tag: self.data.showTips || '',
					desc: self.data.goodsDesc || '',
					min_price: self.data.goodsPrice,
					num: self.data.goodsNum
				},
				success(res) {
					if (res.code == 0) {
						wx.showModal({
							title: res.msg,
							showCancel: false,
							success(res) {
								if (res.confirm) {
									wx.navigateBack()
								}
							}
						})
					} else {
						wx.showModal({
							title: res.msg,
							showCancel: false,
						})
					}
				}
			})
		}

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
		this.getCatList()
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
	onShareAppMessage: function() {

	}
})
