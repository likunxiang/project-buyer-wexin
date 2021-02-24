// user/activeRemind/activeRemind.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        statusBar: getApp().globalData.statusBar,
        customBar: getApp().globalData.customBar,
        custom: getApp().globalData.custom,
        showShare: false, //显示分享
        brand_id: '',
        activityRemindList: [],
        id: '', 
        content: '',
        price: '',
        name: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
		getApp().page.onLoad(this, options);
        this.setData({
            brand_id: options.id
        })
        this.getActivityRemindList();
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
    stop() {

    },
    openshare(e) {
        // console.log(e.currentTarget.dataset.content);
        this.setData({
            id: e.currentTarget.dataset.id,
            content: e.currentTarget.dataset.content,
            price: e.currentTarget.dataset.price,
            name: e.currentTarget.dataset.name,
            showShare: true
        })
    },

    copyText() {
        var text = this.data.content;
        console.log(text);
        // console.log(text + '11111');
		wx.setClipboardData({
			data: text,
			success(res) {
				wx.getClipboardData({
					success(res) {

					}
				})
			}
		})
	},
    //关闭分享遮罩
    quxiao() {

        this.setData({
            showShare: false
        })
    },

    getActivityRemindList(){
        getApp().request({
            url: getApp().api.maijia.activity_remind,
            data: {
                brand_id: this.data.brand_id
            },
            success: res => {
                if(res.code == 0) {
                    this.setData({
                        activityRemindList: res.data
                    })
                }
                // else {
                //     getApp().core.showModal({
                //         title: '提示',
                //         content: res.msg,
                //         showCancel: false,
                //     });
                // }
            }
        })
    },

    browsePic(e) {
        let goodsList = this.data.activityRemindList.activities[0].goods;
        let arr = [];
        goodsList.forEach((item,index) => {
            arr.push(goodsList[index].cover_pic);
        })
        wx.previewImage({
            current: e.currentTarget.dataset.pic, // 当前显示图片的http链接
            urls: arr // 需要预览的图片http链接列表
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
    onShareAppMessage: function(res) {
		var user_info = getApp().core.getStorageSync(getApp().const.USER_INFO);
		var mch_id = wx.getStorageSync('_mchInfo').id;
        if(res.target.dataset.type == 1) {
            this.setData({
                showShare: false
            })
        }
        else {
            this.setData({
                showShare: false
            })
            this.copyText();
        }
		return {
		    title: `【${this.data.name}】活动开始啦，全场最低【${this.data.price}】起～点击链接，快进来逛逛吧`,
		    path: 'pages/activity/activity?aid=' + this.data.id + "&user_id=" + user_info.id +
						"&mch_id=" + mch_id,
		    imageUrl: '',
		}
    },

    goActivityPage(e){
        wx.navigateTo({
            url: '/pages/activity/activity?aid=' + e.currentTarget.dataset.id
          })
    }
})