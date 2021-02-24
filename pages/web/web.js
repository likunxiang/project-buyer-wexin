Page({

    /**
     * 页面的初始数据
     */
    data: {
        url: "https://bm.wxim.qinpu.cloud/mobile/online.php?a=621276866",//a 禁止直接访问该文件必须参数
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
		var self = this
        getApp().page.onLoad(this, options);
        if (!getApp().core.canIUse("web-view")) {
            getApp().core.showModal({
                title: "提示",
                content: "您的版本过低，无法打开本页面，请升级至最新版。",
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        getApp().core.navigateBack({
                            delta: 1,
                        });
                    }
                }
            });
            return;
        }  
        let tdata = new Date
        let ntime = tdata.getDay();//防止web-view缓存
        let order_id = options.order_id==''?0:options.order_id;
        let gs_id = options.order_id==''?0:options.gs_id;
        let type = options.type==''?0:options.type;
        this.setData({
            url: self.data.url + '&gid='+ options.user_id + '&user_id='+options.user_id + '&mch_id=' + options.mch_id + '&order_id=' + order_id + '&gs_id=' + gs_id+'&type='+type +'&nt='+ntime
        });

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function (options) {
        getApp().page.onReady(this);

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function (options) {
        getApp().page.onShow(this);

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function (options) {
        getApp().page.onHide(this);

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function (options) {
        getApp().page.onUnload(this);

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (options) {
        getApp().page.onShareAppMessage(this);
        return {
            path: 'pages/web/web?url=' + encodeURIComponent(options.webViewUrl)
        };
    }
});