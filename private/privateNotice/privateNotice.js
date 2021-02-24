// pages//private/privateNotice/privateNotice.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		picList:[],
		shopAd: '',
		shopAddress: '',
		shopMobile: '',
		shopBoss: '',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.getAdAndSetting()
	},
	getAdAndSetting () {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_my_shop,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success(res) {
				if (res.code == 0) {
					var picList = []
					for (var j in res.data.cover_pic_arr) {
						wx.downloadFile({
							url: res.data.cover_pic_arr[j],
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
					self.setData({
						shopAd: res.data.ad,
						
						shopAddress: res.data.address,
						shopMobile: res.data.mobile,
						shopBoss: res.data.name
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
	upPic () {
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
		picList.splice(index,1)
		self.setData({
			picList: picList
		})
	},
	editShop() {
		var self = this
		var pic_complete_count = 0
		var pic_url_list = []
		if (self.data.picList.length > 0) {
			getApp().core.showLoading({
				title: "正在上传图片",
				mask: true,
			});
			for (var i in self.data.picList) {
				(function (i) {
				    getApp().core.upFile({
				        url: getApp().api.selfSupport.upload_image,
				        filePath: self.data.picList[i],
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
				            if (pic_complete_count == self.data.picList.length) {
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
				url: getApp().api.selfSupport.edit_shop,
				method: 'POST',
				data: {
					userId: getApp().core.getStorageSync('USER_INFO').id,
					cover_pic: pic_url_list,
					ad: self.data.shopAd,
					address: self.data.shopAddress,
					mobile: self.data.shopMobile,
					name: self.data.shopBoss,
				},
				success(res) {
					if (res.code == 0) {
						wx.showModal({
							title: res.msg,
							showCancel: false,
							success: (res) => {
								if(res.confirm) {
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
	getShopAd(e) {
		this.setData({
			shopAd: e.detail.value
		})
	},
	getShopAddress(e) {
		this.setData({
			shopAddress: e.detail.value
		})
	},
	getShopMobile(e) {
		this.setData({
			shopMobile: e.detail.value
		})
	},
	getShopBoss(e) {
		this.setData({
			shopBoss: e.detail.value
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
