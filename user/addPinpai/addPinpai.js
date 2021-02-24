// user/addPinpai/addPinpai.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		statusBar: getApp().globalData.statusBar,
		customBar: getApp().globalData.customBar,
		custom: getApp().globalData.custom,
		page: 1
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {

	},
	// 组件传值出来
	bindData(e) {
		if (e.detail) {
			var checkArrName = e.detail.checkArrName
			var checkArrString = ''
			for (let i in e.detail.checkArrName) {
				if (i<checkArrName.length - 1) {
					checkArrString += checkArrName[i] + ','
				} else {
					checkArrString += checkArrName[i]
				}
			}
			if (this.data.type == 1) {
				this.setData({
					userIds: e.detail.checkArr,
					checkArr1: e.detail.checkArr,
					checkArrName1: e.detail.checkArrName,
					userValue: checkArrString
				})
			} else {
				this.setData({
					brandIds: e.detail.checkArr,
					checkArr2: e.detail.checkArr,
					checkArrName2: e.detail.checkArrName,
					brandValue: checkArrString
				})
			}
		}
	},
	// 增加用户和品牌一起传
	addBrandUser() {
		getApp().request({
			url: getApp().api.maijia.add_brand,
			method: 'POST',
			data: {
				brand_ids: this.data.brandIds || '',
				user_ids: this.data.userIds || '',
				brand_name: this.data.keyword || '', 
			},
			success: (res) => {
				if (res.code == 0) {
					wx.showModal({
						content: '操作成功',
						cancelText: '返回',
						success: (res) => {
							if(res.cancel) {
								wx.navigateBack()
							}
						}
					})
				}
			}
		})
	},
	// 搜索
	searchData(e) {
		if (e.detail) {
			this.setData({
				keyword: e.detail.keyword,
				page: 1
			})
		}
		this.getDataList()
	},
	// 删除
	delBrand(e) {
		var index = e.currentTarget.dataset.index
		var id = e.currentTarget.dataset.id
		var brandList = this.data.brandList
		wx.showModal({
			content: '删除后，活动开始将无法提醒确定删除吗？',
			success: (res) => {
				if (res.confirm) {
					brandList.splice(index, 1)
					getApp().request({
						url: getApp().api.maijia.del_brand,
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
						}
					})
				}
			}
		})
	},
	//打开选择器
	openChoose(e) {
		var type = e.currentTarget.dataset.type

		if (type == 1) {
			var url = getApp().api.maijia.add_client_list
			var title = '顾客名称'
			var placeholder = '请选择顾客昵称'
			var checkArr = this.data.checkArr1 || []
			var checkArrName = this.data.checkArrName1 || []
		} else {
			var url = getApp().api.maijia.add_brand_list
			var title = '品牌名称'
			var placeholder = '请选择品牌名称'
			var checkArr = this.data.checkArr2 || []
			var checkArrName = this.data.checkArrName2 || []
		}
		this.setData({
			checkArr: checkArr,
			checkArrName: checkArrName,
			isShow: true,
			url: url,
			title: title,
			placeholder: placeholder,
			type: type,
			keyword: '',
		})
		this.getDataList()
	},
	getDataList() {
		getApp().request({
			url: this.data.url,
			data: {
				keyword: this.data.keyword || '',
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
	getMore() {
		var self = this
		var url = this.data.url
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
			var nowBrandList = self.data.arrData.concat(newBrandList)
			self.setData({
				arrData: nowBrandList,
			})
		})
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
