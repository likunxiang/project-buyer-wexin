// pages/remind/remind.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		currentIndex: 0,
		status: 4,
		page: 1 ,
		
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			//拿到当前索引并动态改变
			currentIndex: options.idx || 0
		})
	},
	getOrderRefund: function() {
		var self = this
		getApp().core.showLoading({
			title:'加载中...'
		})
		getApp().request({
			url: getApp().api.order.after_sale,
			data: {
				after_sale_status: self.data.currentIndex,
				
				status: 4
			},
			success: function(res) {
				getApp().core.hideLoading();
				if (res.code == 0) {

					self.setData({
						order_list: res.data.list,
						orderAll: res.data,
						// pay_type_list: res.data.pay_type_list
						count: res.data.row_count
					});

				}
				self.setData({
					show_no_data_tip: (self.data.order_list.length == 0),
				});
			},
			complete: function() {
				
				getApp().core.stopPullDownRefresh();
			}
		});
	},
	//用户点击tab时调用
	titleClick: function(e) {
		var self = this
		let currentPageIndex =
			this.setData({
				//拿到当前索引并动态改变
				currentIndex: e.currentTarget.dataset.idx
			})
		if (self.data.currentIndex == 0) {
			getApp().core.showLoading({
				title:'加载中...'
			})
			getApp().request({
				
				url: getApp().api.order.after_sale,
				data: {
					after_sale_status: 0,
					status: 4
				},
				success: function(res) {
					getApp().core.hideLoading();
					if (res.code == 0) {

						self.setData({
							order_list: res.data.list,
							orderAll: res.data,
							// pay_type_list: res.data.pay_type_list
							count: res.data.row_count
						});

					}
					self.setData({
						show_no_data_tip: (self.data.order_list.length == 0),
					});
				},
				complete: function() {
					getApp().core.hideLoading();
				}
			});
		}
		if (self.data.currentIndex == 1) {
			getApp().core.showLoading({
				title:'加载中...'
			})
			getApp().request({
				url: getApp().api.order.after_sale,
				data: {
					after_sale_status: 1,
					
					status: 4
				},
				success: function(res) {
					getApp().core.hideLoading();
					if (res.code == 0) {
		
						self.setData({
							order_list: res.data.list,
							orderAll: res.data,
							// pay_type_list: res.data.pay_type_list
							count: res.data.row_count
						});
		
					}
					self.setData({
						show_no_data_tip: (self.data.order_list.length == 0),
					});
				},
				complete: function() {
					
				}
			});
		}
	},
	link: function() {
		wx.navigateTo({
			url: '../activity-detail/activity-detail?id=1' // 页面 A
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
		this.getOrderRefund()
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
		this.getOrderRefund()
		this.setData({
			page:1
		})
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {
		var self = this;
		// if (is_loading || is_no_more)
		// 	return;
		// is_loading = true;
		var page = self.data.page
		
		if (self.data.order_list.length < self.data.count) {
			++page
			self.setData({
				page: page
			})
		} else {
			return
		}
		
		getApp().core.showLoading({
			title:'加载中...'
		})
		getApp().request({
			url: getApp().api.order.after_sale,
			data: {
				after_sale_status:self.data.currentIndex,
				status: 4,
				page: page,
			},
			success: function(res) {
				getApp().core.hideLoading()
				if (res.code == 0) {
		
					var order_list = self.data.order_list.concat(res.data.list);
					self.setData({
						order_list: order_list,
						
					});
					// if (res.data.list.length == 0) {
					// 	is_no_more = true;
					// }
				}
				
			},
			
		});
	},

	/**
	 * 用户点击右上角分享
	 */
	// onShareAppMessage: function() {

	// },
	onPullDownRefresh() {
		this.getOrderRefund()
	}
})
