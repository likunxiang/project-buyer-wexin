// user/remindAll/remindAll.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        statusBar: getApp().globalData.statusBar,
        customBar: getApp().globalData.customBar,
        custom: getApp().globalData.custom,
        allRemindList: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getAllRemind();
		this.setData({
			msg_empty: getApp().core.getStorageSync('_img').msg
		})
    },
    
    getAllRemind(){
        getApp().request({
            url: getApp().api.maijia.all_remind,
            success: res => {
                if(res.code == 0) {
                    this.setData({
                        allRemindList: res.data
                    })
                }
            }
        })
    },

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
    //详情页面
    toDetail(e) {
        wx.navigateTo({
            url: '/user/activeRemind/activeRemind?id=' + e.currentTarget.dataset.id
        });
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