// user/addLike/addLike.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        statusBar: getApp().globalData.statusBar,
        customBar: getApp().globalData.customBar,
        custom: getApp().globalData.custom,
        arrData: [{
                name: '张珊',
            },
            {
                name: '历史',
            },
            {
                name: '文化',
            }
        ],
        isShow: false, //显示选择组件
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

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
			url: url
        })
		this.getDataList()
    },
	getDataList () {
		getApp().request({
			url: this.data.url,
			data: {
				keyword: this.data.keyword || '',
			},
			success: (res) => {
				if (res.code == 0) {
					this.setData({
						arrData: res.data
					})
				}
			}
		})
	},
    //测试组件生命周期
    test1() {
        // this.setData({
        //     showTest: !this.data.showTest
        // })
        wx.showModal({
            title: '',
            content: '<text style="color:red;">65656565665</text>',
            showCancel: false,
            cancelText: '别点我会',
            cancelColor: '#ff0000',
            confirmText: '确定',
            confirmColor: '#bf6ec7',
            success: (result) => {
                if (result.confirm) {
                }
            },
            fail: () => {},
            complete: () => {}
        });
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },
    //取消选择
    quxiao(e) {
        this.setData({
            isShow: false
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