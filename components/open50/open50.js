module.exports = {
	currentPage: null,
	/**
	 * 注意！注意！！注意！！！
	 * 由于组件的通用，部分变量名称需统一，在各自引用的xxx.js文件需定义，并给对应变量赋相应的值
	 * 以下变量必须定义并赋值
	 * 
	 * 持续补充...
	 */
	init: function(self) {
		var _this = this;
		_this.currentPage = self;
		self.setData({
			openImg: getApp().core.getStorageSync('_img').white_money
		});
		if (typeof self.closeToastMch === 'undefined') {
			self.closeToastMch = function(e) {
				_this.closeToastMch(e);
			}
		}
		if (typeof self.closeToastMch1 === 'undefined') {
			self.closeToastMch1 = function(e) {
				_this.closeToastMch1(e);
			}
		}
	},
	closeToastMch: function() {
		var self = this.currentPage
		self.setData({
			open_mch_50: 1
		})
	},
	closeToastMch1: function() {
		var self = this.currentPage
		self.setData({
			open_mch_50: 1
		})
		getApp().request({
			url: getApp().api.user.updata_mch_tips,
			data: {},
			success: (res) => {
				if (res.code == 0) {
					
				}
			}
		})
		wx.navigateTo({
			url: '/member/paySucceed/paySucceed'
		})
	},


}
