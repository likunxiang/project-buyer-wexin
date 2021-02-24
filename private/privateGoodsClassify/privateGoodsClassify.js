// pages//private/privateGoodsClassify/privateGoodsClassify.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		classifyList: [],
		is_classify: false,
		catName: ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.getCatList()
	},
	editClassify (e) {
		var index = e.currentTarget.dataset.index
		var cat_id = e.currentTarget.dataset.id
		var classifyList = this.data.classifyList
		var name = classifyList[index].name
		this.setData({
			catName: name,
			cat_id: cat_id,
			is_classify: true,
			showDel: true
		})
	},
	openClassify () {
		this.setData({
			is_classify: true,
			catName: '',
			cat_id: '',
			showDel: false
		})
	},
	closeClassify () {
		this.setData({
			is_classify: false
		})
	},
	delClassify () {
		wx.showModal({
			title: '确定删除该分类？',
			success: (res) => {
				if (res.confirm) {
					getApp().request({
						url: getApp().api.selfSupport.del_cat,
						data: {
							userId: getApp().core.getStorageSync('USER_INFO').id,
							id: this.data.cat_id
						},
						success: (res) => {
							if (res.code == 0) {
								this.closeClassify()
								this.getCatList()
							} else {
								wx.showModal({
									title: res.msg,
									showCancel: false,
								})
							}
						}
					})
				}
			}
		})
		
	},
	stop () {
		return
	},
	getCatName (e) {
		this.setData({
			catName: e.detail.value
		})
	},
	getGoodsCat () {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.edit_cat,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				name: self.data.catName,
				id: self.data.cat_id || '',
			},
			success(res) {
				if (res.code == 0) {
					self.getCatList()
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			}
		})
	},
	setTop (e) {
		var self = this
		var id = e.currentTarget.dataset.id
		getApp().request({
			url: getApp().api.selfSupport.set_cat_top,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
				id: id,
			},
			success(res) {
				if (res.code == 0) {
					wx.showToast({
						title: res.msg,
						icon: 'none'
					})
					self.getCatList()
				} else {
					wx.showModal({
						title: res.msg,
						showCancel: false,
					})
				}
			}
		})
	},
	getCatList () {
		var self = this
		getApp().request({
			url: getApp().api.selfSupport.get_cat_list,
			data: {
				userId: getApp().core.getStorageSync('USER_INFO').id,
			},
			success(res) {
				if (res.code == 0) {
					self.setData({
						classifyList: res.data
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
	saveCat () {
		this.getGoodsCat()
		this.closeClassify()
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
