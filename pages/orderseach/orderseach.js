// pages/withdrawal/withdrawal.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    x: getApp().core.getSystemInfoSync().windowWidth,
    y: getApp().core.getSystemInfoSync().windowHeight,
    user:{},
    seachVal:'',
    showHistor: false,      //历史记录
    historyList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().page.onLoad(this, options);
    this.loadData(options);
  },
  // 清除历史记录
  removeHistory: function () {
    wx.removeStorageSync('order_History');
    this.setData({
      showHistor: false,
      historyList: []
    })
  },
  loadData: function (options) {
    // 获取用户信息
    let storeUser = getApp().core.getStorageSync('USER_INFO');
    if (storeUser && storeUser.length != 0) {
      this.setData({
        user: {
          nickname: storeUser.nickname,
          avatar_url: storeUser.avatar_url
        }
      })
    }
    // 获取缓存
    if (getApp().core.getStorageSync("order_History")) {
      this.setData({
        showHistor: true,
        historyList: JSON.parse(getApp().core.getStorageSync("order_History"))
      })
    }
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
    getApp().getStoreData();
    this.loadData();
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
  //     path: "/pages/index/index?user_id=" + user_info.id+"&mch_id="+mch_id,
  //     title: self.data.store.name
  //   };
  // },
  onHide: function () {
    getApp().page.onHide(this);
  },
  onUnload: function () {
    getApp().page.onUnload(this);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  // 点击历史搜索
  history:function(e){
    var val = e._relatedInfo.anchorTargetText,self=this;
    this.setData({
      seachVal: val
    },()=>{
      self.sendSeach();
    })
  },
  // 清空输入框
  clearVal:function(){
    if (this.data.seachVal!=''){
      this.setData({
        seachVal: ''
      })
    }
  },
  // 搜索
  sendSeach:function(){
    var val = this.data.seachVal;
    if(this.data.seachVal.trim()==''){
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (val != '') {
      if (getApp().core.getStorageSync("order_History")) {
        var searchList = JSON.parse(getApp().core.getStorageSync("order_History"));
        if (searchList.indexOf(val) == -1) {
          searchList.push(val);
          getApp().core.setStorageSync("order_History", JSON.stringify(searchList))
        }
      } else {
        var searchList = [val];
        getApp().core.setStorageSync("order_History", JSON.stringify(searchList))
      }
    }
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.setData({
      code: this.data.seachVal
    });
    wx.navigateBack({
      delta: 1,
    })
  },
  seachInput: function (e) {
    var val = e.detail.value;
    this.setData({
      seachVal: val,
    })
  },
})