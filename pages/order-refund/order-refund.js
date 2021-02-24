	var app = getApp();
var api = getApp().api;
var goodsRefund = require('../../components/goods/goods_refund.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isPageShow: false,
		pageType: 'STORE',
		goods: {},
		refund_data: {},
		returnCause: [],
		reciveStatus: [],
		tuikuangCause: [],
		refundType: [{
			id: 1,
			name: "退货退款"
		}, {
			id: 3,
			name: "退款"
		}],
		defaultReturnIndex: 0,
		defaultReciveIndex: 0,
		defaultTuiKuangIndex: 0,
		defaultRefundIndex: 0,
		defaultPickIndex: 0,
		// returnIndex: 0,
		// reciveIndex: 0,
		// tuikuangIndex: 0,
		refund_status: 1, //退款类型
		refundId: getApp().core.getStorageSync('refundId'),
		sendId: getApp().core.getStorageSync('sendId'),
		packagingStatus: [{
				type: 0,
				name: '无包装'
			},
			{
				type: 10,
				name: '包装完整'
			},
			{
				type: 20,
				name: '包装破损'
			}
		],
		packagingIns: 0,
		is_package: [{
				type: 1,
				name: '是'
			},
			{
				type: 0,
				name: '否'
			},
		],
		packageIns: 1,
		is_check: [{
				type: 1,
				name: '是'
			},
			{
				type: 0,
				name: '否'
			},
		],
		checkIns: 0,
		sendWay: [{
				type: 4,
				name: '上门取件'
			},
			{
				type: 40,
				name: '客户发货'
			},
		],
		sendWayIns: 4,
		aog: [{
				type: 10,
				name: '京东配送'
			},
			{
				type: 20,
				name: '第三方物流'
			},
		],
		aogIns: 10,
		show_jd: true  //用于判断  待发货 true是非待发货

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		getApp().page.onLoad(this, options);
		var self = this;
		this.setData({
			refund_status: options.status
		})
		if (options.refund_type_id) {
			this.setData({
				refund_type_id: 3,
				show_jd: false
			})
			this.getReasonList()
		}
		if (this.data.refund_status == 3) {
			self.setData({
				switch_tab_1: "",
				switch_tab_2: "active",
			});
		}
		wx.showLoading({
			title: '加载中',
		})
		getApp().request({
			url: getApp().api.order.refund_preview,
			data: {
				order_detail_id: options.id,
			},
			success: function(res) {
				wx.hideLoading();
				if (res.code == 0) {
					// var sup_info = wx.getStorageSync('SUP_INFO',res.supp_info)
					// if (!sup_info) {
					// 	wx.setStorageSync('SUP_INFO',res.supp_info)
					// }
					// var sup_id = res.supp_id

					self.setData({
						goods: res.data,
						refund_num: res.data.num,
						refund_price: res.data.total_price,
						returnCause: res.data.reasons_for_return, // 退货原因
						reciveStatus: res.data.receipt_status, // 收货状态
						refundType: res.data.refund_type,
						warn: res.warn,
						isPageShow: true,
						sup_id: res.supp_id, // 0 不是京东订单 1是京东订单
					});
				}
				if (res.code == 1) {
					getApp().core.showModal({
						title: "提示",
						content: res.msg,
						image: "/images/icon-warning.png",
						success: function(res) {
							if (res.confirm) {
								getApp().core.navigateBack();
							}
						}
					});
				}
			}
		});
	},
	editNum() {
		this.setData({
			is_edit_num: true
		})
	},
	inputNum(e) {
		if (e.detail.value > this.data.goods.num) {
			wx.showToast({
				title: '数量错误',
				icon: 'none'
			})
			this.setData({
				is_edit_num: false,
				refund_num: this.data.goods.num
			})
		} else {
			this.setData({
				is_edit_num: false,
				refund_num: e.detail.value
			})
		}
	},
	editPrice() {
		this.setData({
			is_edit_price: true
		})
	},
	inputPrice(e) {
		if (e.detail.value > this.data.goods.total_price) {
			wx.showToast({
				title: '金额错误',
				icon: 'none'
			})
			this.setData({
				is_edit_price: false,
				refund_price: this.data.goods.total_price
			})
		} else {
			this.setData({
				is_edit_price: false,
				refund_price: e.detail.value
			})
		}
	},
	changePackaging(e) {
		var index = e.currentTarget.dataset.index
		this.setData({
			packagingIns: index
		})
	},
	changePackage(e) {
		var index = e.currentTarget.dataset.index
		this.setData({
			packageIns: index
		})
	},
	changeCheck(e) {
		var index = e.currentTarget.dataset.index
		this.setData({
			checkIns: index
		})
	},
	changeSendWay(e) {
		var index = e.currentTarget.dataset.index
		this.setData({
			sendWayIns: index
		})
	},
	changeAog(e) {
		var index = e.currentTarget.dataset.index
		var packagingStatus = this.data.packagingStatus
		this.setData({
			aogIns: index
		})
	},
	// bindRefundChange: function(e) {
	// 	var id = this.data.refundType[e.detail.value].id
	// 	this.setData({
	// 		defaultRefundIndex: 1,
	// 		refundIndex: e.detail.value,
	// 		refundId: id
	// 	})
	// 	this.getReasonList()

	// },
	// v1.10
	bindRefundType (e) {
		var self = this
		var id = e.currentTarget.dataset.id
		self.setData({
			refund_type_id: id,
		});
		this.getReasonList()
	},
	bindReturnChange: function(e) {
		this.setData({
			defaultReturnIndex: 1,
			returnIndex: e.detail.value
		})
	},
	bindStatusChange: function(e) {
		this.setData({
			defaultReciveIndex: 1,
			reciveIndex: e.detail.value
		})
	},
	bindTuiKuangChange: function(e) {
		this.setData({
			defaultTuiKuangIndex: 1,
			tuikuangIndex: e.detail.value
		})
	},
	// 收货状态 
	bindPickStatus(e) {
		this.setData({
			defaultPickIndex: 1,
			pickIndex: e.detail.value
		})
		var type = this.data.pickStatus[this.data.pickIndex].id
		// var type = this.data.refund_type_id
		if (type == 1) {
			this.setData({
				tuikuangCause: this.data.tuikuangCause_16[2]
			})
		} else {
			this.setData({
				tuikuangCause: this.data.tuikuangCause_16[1]
			})
		}
	},
	getReasonList() {
		// var type = this.data.refundType[this.data.refundIndex].id
		var type = this.data.refund_type_id
		getApp().request({
			url: getApp().api.order.getReason,
			data: {
				type: type,
				supp_id: this.data.sup_id
			},
			success: (res) => {
				if (res.code == 0) {
					if (type == 1) {
						this.setData({
							tuikuangCause: res.data.reasons_for_return, // 退款原因
							type: type
						})
					} else {
						this.setData({
							tuikuangCause: res.data.reason_for_return, // 退款原因
							type: type
						})
						if (this.data.sup_id == 16) {
							this.setData({
								tuikuangCause_16: res.data.reason_for_return, // 退款原因
								pickStatus: res.data.receipt_status,
								type: type
							})
						}
					}
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			}
		})
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {
		getApp().page.onReady(this);
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		getApp().page.onShow(this);
		goodsRefund.init(this);
	},
});
