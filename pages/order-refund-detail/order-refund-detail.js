var app = getApp();
var api = getApp().api;
var goodsSend = require('../../components/goods/goods_send.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isPageShow: false,
        pageType: 'STORE',
        order_refund: null,
        express_index: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        getApp().page.onLoad(this, options);
        var self = this;
		self.setData({
		    order_refund_id: options.id,
			nickName: getApp().core.getStorageSync('USER_INFO').nickname,
			avatarUrl: getApp().core.getStorageSync('USER_INFO').avatar_url,
			userId: getApp().core.getStorageSync('USER_INFO').id,
			mchId: getApp().core.getStorageSync('_mchInfo').id,
			storeId: getApp().core.getStorageSync('STORE').id,
			type: 3 // 售后进入
		});
        getApp().core.showLoading({
            title: "正在加载",
        });
        getApp().request({
            url: getApp().api.order.refund_detail,
            data: {
                order_refund_id: options.id,
            },
            success: function (res) {
                if (res.code == 0) {
                    self.setData({
                        order_refund: res.data,
						order_refund_desc: res.desc, 
                        isPageShow: true,
                    });
                }
            },
            complete: function () {
                getApp().core.hideLoading();
            }
        });
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
	cancelRefund: function () {
		var self = this
		wx.showModal({
			content: '是否取消申请',
			success:function(res){
				if (res.confirm) {
					getApp().request({
						url: getApp().api.order.cancel_refund,
						method:'POST',
						data: {
							order_refund_id: self.data.order_refund_id
						},
						success: function (res) {
							if( res.code == 0 ) {
								wx.showToast({
									title:res.msg,
									icon:'none',
									duration:2000,
									success:function(res) {
										wx.navigateBack()
									}
								})
							} else {
								wx.showToast({
									title:res.msg,
									icon:'none',
									duration:2000
								})
							}
						}
					})
				}
			}
		})
		
	},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        getApp().page.onShow(this);
        goodsSend.init(this);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },
});