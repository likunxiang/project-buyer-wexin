// pages/brandLike/brandLike.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isShow: false,
		page: 1
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		getApp().page.onLoad(this, options)
		var token = getApp().core.getStorageSync('ACCESS_TOKEN')
		if (!token) {
			this.setData({
				showGetLogin: true,
				user_info_show: true,
			})
			return
		}
		this.getBrandList()
		this.setData({
			brandEmpty: getApp().core.getStorageSync('_img').guan_zhu_brand,
		})
	},
	// 搜索
	searchData (e) {
		if (e.detail) {
			this.setData({
				keyword: e.detail.keyword,
				page: 1
			})
		}
		this.getChooseBrandList()
	},
	recoverSwitch (e) {
		var brand_id = e.currentTarget.dataset.id
		getApp().request({
			url: getApp().api.default.open_brand_activity,
			method: 'POST',
			data: {
				brand_id: brand_id
			},
			success: (res) => {
				if (res.code == 0) {
					wx.showToast({
						title: '操作成功',
						icon: 'none'
					})
					this.getBrandList()
				}
			}
		})
		//TODO
	},
	delBrand(e) {
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var brandList = this.data.brandList
		wx.showModal({
			content: '删除后，活动开始将无法提醒确定删除吗？',
			success: (res) => {
				if (res.confirm) {
					brandList.splice(index, 1)
					getApp().core.showLoading({
						title: '删除中...'
					})
					getApp().request({
						url: getApp().api.default.del_brand,
						method: 'POST',
						data: {
							id: id
						},
						success: (res) => {
							if (res.code == 0) {
								this.setData({
									brandList: brandList
								})
							}
						},
						complete: (res) => {
							getApp().core.hideLoading()
						}
					})
				}
			}
		})
	},
	getMore () {
		var self = this
		var url = getApp().api.default.get_brand_list
		var page = self.data.page
		var data = {
			keyword: this.data.keyword || '',
		}
		getApp().core.pading(self, url, data, function(res) {
			if (res.data.length == 0) {
				self.setData({
					stopLoadMore: true,
				})
				return
			}
			var newBrandList = res.data
			var nowBrandList = self.data.chooseBrandList.concat(newBrandList)
			self.setData({
				chooseBrandList: nowBrandList,
			})
		})
	},
	getBrandList() {
		getApp().request({
			url: getApp().api.default.get_brand_show,
			data: {
				page: 1
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						brandList: res.data
					})
				}
			}
		})
	},
	getChooseBrandList() {
		getApp().request({
			url: getApp().api.default.get_brand_list,
			data: {
				keyword: this.data.keyword || '',
				page: 1
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						chooseBrandList: res.data
					})
				}
			}
		})
	},
	// 是否提醒
	changeRemind (e) {
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var brandList = this.data.brandList
		var is_remind = 0
		if (brandList[index].is_remind == 1) {
			is_remind = 0
		} else {
			is_remind = 1
		}
		this.setData({
			['brandList['+ index +'].is_remind']: is_remind
		})
		getApp().request({
			url: getApp().api.default.updata_brand,
			method: 'POST',
			data: {
				id: id,
				is_remind: is_remind
			},
			success: (res) => {
				if (res.code == 0) {
					
				} else {
					wx.showModal({
						content: res.msg,
						showCancel: false
					})
				}
			}
		})
		
	},
	// 组件传值出来
	bindData (e) {
		if(e.detail) {
			this.setData({
				checkArr: e.detail.checkArr,
			})
		}
		this.addBrand()
	},
	addBrand () {
		getApp().request({
			url: getApp().api.default.add_brand,
			method: 'POST',
			data: {
				brand_ids: this.data.checkArr || '',
				user_ids: this.data.userId || '',
				brand_name: this.data.keyword || '', 
			},
			success: (res) => {
				if (res.code == 0) {
					wx.showToast({
						icon: 'none',
						title: '添加成功'
					})
					this.getBrandList()
				}
			}
		})
	},
	//打开选择器
	openChoose(e) {
		var token = getApp().core.getStorageSync('ACCESS_TOKEN')
		if (!token) {
			this.setData({
				showGetLogin: true,
				user_info_show: true,
			})
			return
		}
		var type = e.currentTarget.dataset.type
		
		if (type == 1) {
			var url = getApp().api.maijia.add_client_list
		} else {
			var url = getApp().api.maijia.add_brand_list
		}
		this.setData({
			isShow: true,
			type: type,
			keyword: '',
			page: 1
		})
		this.getChooseBrandList()
	},
	//取消选择
	quxiao(e) {
		this.setData({
			isShow: false
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
