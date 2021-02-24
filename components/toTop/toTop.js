module.exports = {
	currentPage: null,
	init: function(self) {
		var _this = this;
		_this.currentPage = self;
		if (typeof self.toTop == 'undefined') {
			self.toTop = function(e) {
				_this.toTop(e);
			}
		}
	},
	toTop: function() {
		var self = this.currentPage
		if (self.data.pageTop == 'normal') {
			self.setData({
				topNum: 0,
				is_top: false
			});
		} else {
			wx.pageScrollTo({
				scrollTop: 0
			})
		}

	}
}
