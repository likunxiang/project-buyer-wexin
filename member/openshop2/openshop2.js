// pages/openshop2/openshop2.js
var postData = {};
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
		this.getQuestionnaire()
	},
	expText: function(e) {
		var text = e.detail.value
		this.setData({
			expValue: text
		})
	},
	changeExp: function(e) {
		var self = this
		var index = e.currentTarget.dataset.index
		var radioIndex = e.currentTarget.dataset.radioindex
		var text = e.currentTarget.dataset.text
		var arr = self.data.q_list
		arr[radioIndex].ins = index
		self.setData({
			q_list: arr
		})
		var qid = e.currentTarget.dataset.qid;
		var oid = e.currentTarget.dataset.oid;

		if (!postData[qid]) {
			postData[qid] = {};
		}
		postData[qid][oid] = index;
	},
	checkboxChange: function(e) {
		var value = e.detail.value
		var oid = e.currentTarget.dataset.oid;
		var qid = e.currentTarget.dataset.qid;
		var check_oid = 'oid' + oid
		if (!postData[qid]) {
			postData[qid] = {};
		}
		postData[qid][oid] = value;
		// var quesRow = arr[radioIndex];
		// postData[quesRow.qid][oid]= index;
		// console.log(this.data.value3);
	},
	getQuestionnaire: function() {
		getApp().request({
			url: getApp().api.default.questionnaire,
			success: (res) => {

				// for (var i in res.data.q_list) {
				// 	if (res.data.q_list[i].op_list[0].input_type == 1) {
				// 		res.data.q_list[i].ins = 'o1'
				// 	}
				// }
				this.setData(res.data)
			}
		})
	},
	savaData: function() {
		var self = this
		// if (postData.length == 0) {
		// 	wx.showToast({
		// 		title: '您还有信息没填',
		// 		icon: 'none'
		// 	})
		// 	return false
		// } else {
		let vdata = JSON.stringify(postData);
		getApp().request({
			url: getApp().api.default.questionnaire_save,
			method: 'POST',
			data: {
				'q_val': vdata
			},
			success: (res) => {
				if (res && res.code == 0) {
					getApp().core.navigateTo({
						url: '/member/openshop3/openshop3'
					});
				} else {
					wx.showToast({
						title: res.msg || '网络错误',
						duration: 2500,
						icon: 'none'
					});
				}
			}
		})
		// }

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
