// pages/withdrawal/withdrawal.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    x: getApp().core.getSystemInfoSync().windowWidth,
    y: getApp().core.getSystemInfoSync().windowHeight,
    shopInfo:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().page.onLoad(this, options);
    this.loadData(options);
  },
  loadData: function (options) {
    var self=this;
    // 是否已申请
    getApp().request({
      url: getApp().api.mch.apply,
      success: function (res) {
        if (res.code == 0) {
          self.setData({
            shopInfo:res.data
          })
        } else {
          if (res.msg) {
            wx.showToast({
              title: res.msg,
              icon: 'none',
              duration: 1500
            })
          }
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },
  /**
     * 页面相关事件处理函数--监听用户上拉动作
     */
  onReachBottom: function () {

  },
  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function (options) {
  //   getApp().page.onShareAppMessage(this);
  //   var self = this;
  //   var user_info = getApp().getUser();
  //   var mch_id = wx.getStorageSync('_mchInfo').id;
  //   return {
  //     path: "/pages/openres/openres?user_id=" + user_info.id+"&mch_id="+mch_id,
  //     title: self.data.store.name
  //   };
  // },
  onHide: function () {

  },
  onUnload: function () {

  },
})