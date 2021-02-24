// user/pinpaiLike/pinpaiLike.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        statusBar: getApp().globalData.statusBar,
        customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom,
		page: 1,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
		this.setData({
			brandId: options.brand_id,
			brandName: options.brand_name
		})
		this.getUserList()
    },
	getUserList() {
		
		getApp().request({
			url: getApp().api.maijia.user_brand_attention,
			data: {
				brand_id: this.data.brandId,
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						userList: res.data
					})
				} else {
	
				}
			}
		})
	},
    //返回
    returnPage() {
        wx.navigateBack({
            delta: 1,
    		fail: (res) => {
    			wx.redirectTo({
    				url: '/pages/index/index'
    			})
    		}
        })
    },
    //添加顾客
    addUser() {
        wx.navigateTo({
            url: '/user/addLike/addLike',

        });
    },
	//打开选择器
	openChoose(e) {
		var type = e.currentTarget.dataset.type
		
		if (type == 1) {
			var url = getApp().api.maijia.add_client_list
		} else {
			var url = getApp().api.maijia.add_brand_list
		}
	    this.setData({
	        isShow: true,
			url: url,
			type: type,
			keyword: '',
	    })
		this.getDataList()
	},
	getDataList () {
		getApp().request({
			url: this.data.url,
			data: {
				keyword: this.data.keyword || '',
				brand_id: this.data.brandId || '',
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						arrData: res.data,
					})
				}
			}
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
		this.getDataList()
	},
	// 组件传值出来
	bindData (e) {
		if(e.detail) {
			this.setData({
				checkArr: e.detail.checkArr
			})
		}
		this.addBrand()
	},
	addBrand () {
		getApp().request({
			url: getApp().api.maijia.add_brand,
			method: 'POST',
			data: {
				brand_ids: this.data.brandId || '',
				user_ids: this.data.checkArr || '',
				brand_name: this.data.keyword || '', 
			},
			success: (res) => {
				if (res.code == 0) {
					this.getUserList()
				}
			}
		})
	},
	// 删除
	delUser(e) {
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var userList = this.data.userList
		wx.showModal({
			content: '删除后，活动开始将无法提醒确定删除吗？',
			success: (res) => {
				if (res.confirm) {
					userList.splice(index, 1)
					getApp().request({
						url: getApp().api.maijia.del_brand,
						method: 'POST',
						data: {
							id: id
						},
						success: (res) => {
							if (res.code == 0) {
								this.setData({
									userList: userList
								})
							}
						}
					})
				}
			}
		})
	},
	getMore () {
		var self = this
		var url = this.data.url
		var page = self.data.page
		var data = {
			keyword: this.data.keyword || '',
			brand_id: this.data.brandId || '',
		}
		getApp().core.pading(self, url, data, function(res) {
			if (res.data.length == 0) {
				self.setData({
					stopLoadMore: true,
				})
				return
			}
			var newBrandList = res.data
			var nowBrandList = self.data.arrData.concat(newBrandList)
			self.setData({
				arrData: nowBrandList,
			})
		})
	},
	// 是否提醒
	changeRemind (e) {
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var userList = this.data.userList
		var is_remind = 0
		if (userList[index].is_remind == 1) {
			is_remind = 0
		} else {
			is_remind = 1
		}
		this.setData({
			['userList['+ index +'].is_remind']: is_remind
		})
		getApp().request({
			url: getApp().api.maijia.updata_brand,
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
	//取消选择
	quxiao(e) {
		this.setData({
			isShow: false,
			page: 1
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