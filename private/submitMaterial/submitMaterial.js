// pages/submitMaterial/submitMaterial.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.getRelData()
	},
	getRelData () {
		getApp().request({
			url: getApp().api.selfSupport.get_rel_data,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success: (res) => {
				if (res.code == 0) {
					var rel = res.data.image
					wx.downloadFile({
						url: rel.front,
						success:(res) => {
							if (res.statusCode === 200) {
								var front = res.tempFilePath
								this.setData({
									frontPic: res.tempFilePath
								})
							}
						}
					})
					wx.downloadFile({
						url: rel.rear,
						success:(res) => {
							if (res.statusCode === 200) {
								this.setData({
									reversePic: res.tempFilePath
								})
							}
						}
					})
					wx.downloadFile({
						url: rel.license,
						success:(res) => {
							if (res.statusCode === 200) {
								this.setData({
									businessPic: res.tempFilePath
								})
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
	},
	// 传正面
	upfront () {
		var self = this
		wx.chooseImage({
			count: 1,
			success(res) {
				var tempPic = res.tempFilePaths
				self.setData({
					frontPic: tempPic
				})
			}
		})
	},
	// 传反面
	upReverse () {
		var self = this
		wx.chooseImage({
			count: 1,
			success(res) {
				var tempPic = res.tempFilePaths
				self.setData({
					reversePic: tempPic
				})
			}
		})
	},
	// 传营业执照
	upBusinessLicense () {
		var self = this
		wx.chooseImage({
			count: 1,
			success(res) {
				var tempPic = res.tempFilePaths
				self.setData({
					businessPic: tempPic
				})
			}
		})
	},
	viewPic(e) {
		var self = this
		var url = e.currentTarget.dataset.url
		wx.previewImage({
			current: url
		})
	},
	delPic(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		var picList = self.data.picList
		picList.splice(index,1)
		self.setData({
			picList: picList
		})
	},
	editShop() {
		var self = this
		var pic_complete_count = 0
		var pic_url_list = []
		var picList = []
		if (self.data.frontPic && self.data.reversePic && self.data.businessPic) {
			picList = picList.concat(self.data.frontPic)
			picList = picList.concat(self.data.reversePic)
			picList = picList.concat(self.data.businessPic)
		} else {
			wx.showToast({
				title: '您还有资质图片未上传',
				icon: 'none'
			})
			return false
		}
		
		if (picList.length > 0) {
			getApp().core.showLoading({
				title: "正在上传图片",
				mask: true,
			});
			for (var i in picList) {
				(function (i) {
				    getApp().core.upFile({
				        url: getApp().api.selfSupport.upload_rel_image,
				        filePath: picList[i],
				        name: "image",
				        success: function (res) {
				        },
				        complete: function (res) {
				            pic_complete_count++;
				            if (res.statusCode == 200) {
				                res = JSON.parse(res.data);
				                if (res.code == 0) {
				                    pic_url_list[i] = res.data.image;
				                }
				            }
				            if (pic_complete_count == picList.length) {
				                getApp().core.hideLoading();
				                _submit()
				            }
				        }
				    });
				})(i);
			}
		} else {
			_submit()
		}
		function _submit () {
			getApp().request({
				url: getApp().api.selfSupport.upload_rel,
				data: {
					userId: getApp().core.getStorageSync('USER_INFO').id,
					front: pic_url_list[0],
					rear: pic_url_list[1],
					license: pic_url_list[2]
				},
				success(res) {
					if (res.code == 0) {
						wx.showModal({
							title: res.msg,
							showCancel: false,
							success: (res) => {
								if(res.confirm) {
									wx.redirectTo({
										url: '/private/home/home?type=2'
									})
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
