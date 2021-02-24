// pages/pt/group/details.js

var utils = require('../../../utils/helper.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        groupFail: 0,
        show_attr_picker: false,
        form: {
            number: 1,
        },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) { getApp().page.onLoad(this, options);
        var parent_id = 0;
        var user_id = options.user_id;
        var scene = decodeURIComponent(options.scene);
        if (typeof user_id !== 'undefined') {
            parent_id = user_id;
        } else if (typeof scene !== 'undefined') {
            var scene_obj = utils.scene_decode(scene);
            if (scene_obj.user_id && scene_obj.oid) {
                parent_id = scene_obj.user_id;
                options.oid = scene_obj.oid;
            } else {
                parent_id = scene;
            }
        } else {
            if (typeof my !== 'undefined') {
                if (getApp().query !== null) {
                    var query = getApp().query;
                    getApp().query = null;
                    options.oid = query.oid;
                    parent_id = query.uid;
                }
            }
        }

        this.setData({
            oid: options.oid,
        });
        this.getInfo(options);
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
    onShareAppMessage: function(options) {
        getApp().page.onShareAppMessage(this);
        var self = this;
        var user_info = getApp().core.getStorageSync(getApp().const.USER_INFO);
        var mch_id = wx.getStorageSync('_mchInfo').id;
        var path = '/pages/pt/group/details?oid=' + self.data.oid + '&user_id=' + user_info.id+"&mch_id="+mch_id;
        return {
            title: "快来" + self.data.goods.price + "元拼  " + self.data.goods.name,
            path: path,
            //   imageUrl: self.data.goods.cover_pic,
            success: function(res) {
            }
        }
    },
    /**
     * 获取信息
     */
    getInfo: function(e) {
        var oid = e.oid;
        var self = this;
        getApp().core.showLoading({
            title: "正在加载",
            mask: true,
        });
        getApp().request({
            url: getApp().api.group.group_info,
            method: "get",
            data: {
                oid: oid
            },
            success: function(res) {
			
                if (res.code == 0) {
                    if (res.data.groupFail == 0) {
                        self.countDownRun(res.data.limit_time_ms);
                    }
                    // self.countDownRun(res.data.limit_time_ms);
                    var reduce_price = (res.data.goods.original_price - res.data.goods.price).toFixed(2);
                    self.setData({
                        goods: res.data.goods,
                        groupList: res.data.groupList,
                        surplus: res.data.surplus,
                        limit_time_ms: res.data.limit_time_ms,
                        goods_list: res.data.another.goods_list,
                        group_fail: res.data.groupFail,
                        oid: res.data.oid,
                        in_group: res.data.inGroup,
                        attr_group_list: res.data.attr_group_list,
                        attr: res.data.attr,
                        pt_attr: res.data.pt_attr,
                        // group_rule_id: res.data.groupRuleId,
                        reduce_price: reduce_price < 0 ? 0 : reduce_price,
                        // group_id:res.data.goods.class_group
                    });
                    // if (res.data.groupFail != 0 && res.data.inGroup){
                    //     self.setData({
                    //         oid:false,
                    //         group_id:false
                    //     });
                    // }
                } else {
                    getApp().core.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function(res) {
                            if (res.confirm) {
                                getApp().core.redirectTo({
                                    // url: '/pages/pt/index/index'
                                  url: '/pages/index/index'
                                });
                            }
                        }
                    });
                }
            },
            complete: function(res) {
                setTimeout(function() {
                    // 延长一秒取消加载动画
                    getApp().core.hideLoading();
                }, 1000);
            }
        });
    },

    /**
     * 执行倒计时
     */
    countDownRun: function(limit_time_ms) {
        var self = this;
        setInterval(function() {
            var leftTime = (new Date(limit_time_ms[0], limit_time_ms[1] - 1, limit_time_ms[2], limit_time_ms[3], limit_time_ms[4], limit_time_ms[5])) - (new Date()); //计算剩余的毫秒数 
            var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数 
            var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时 
            var minutes = parseInt(leftTime / 1000 / 60 % 60, 10); //计算剩余的分钟 
            var seconds = parseInt(leftTime / 1000 % 60, 10); //计算剩余的秒数 

            days = self.checkTime(days);
            hours = self.checkTime(hours);
            minutes = self.checkTime(minutes);
            seconds = self.checkTime(seconds);
            self.setData({
                limit_time: {
                    days: days,
                    hours: hours,
                    mins: minutes,
                    secs: seconds,
                },
            });
        }, 1000);
    },
    /**
     * 时间补0
     */
    checkTime: function(i) { //将0-9的数字前面加上0，例1变为01 
        i = i > 0 ? i : 0;
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    },
    /**
     * 返回首页
     */
    goToHome: function() {
        getApp().core.redirectTo({
            // url: '/pages/pt/index/index'
          url: '/pages/index/index'
        })
    },
    /**
     * 前往商品详情
     */
    goToGoodsDetails: function(e) {
        var self = this;
        getApp().core.redirectTo({
            url: '/pages/pt/details/details?gid=' + self.data.goods.id,
        });
    },
    /**
     * 隐藏规格选择框
     */
    hideAttrPicker: function() {
        var self = this;
        self.setData({
            show_attr_picker: false,
        });
    },
    /**
     * 显示规格选择框
     */
    showAttrPicker: function() {
        var self = this;
        self.setData({
            show_attr_picker: true,
        });
    },
  attrClick: function (e) {
    var self = this;
    var groupindex = e.target.dataset.groupindex;
    var childindex = e.target.dataset.childindex;
    var attr_group_list = self.data.attr_group_list;
    
    for (var i in attr_group_list) {
      if (i != groupindex)
        continue;
      for (var j in attr_group_list[i].attr_list) {
        if (j == childindex) {
          attr_group_list[i].attr_list[j].checked = true;
        } else {
          attr_group_list[i].attr_list[j].checked = false;
        }
      }
      self.setData({
        attr_group_list: attr_group_list,
      });
      var checked_attr_list = [];
      for (var i in attr_group_list) {
        var attr = false;
        for (var j in attr_group_list[i].attr_list) {
          if (attr_group_list[i].attr_list[j].checked) {
            attr = {
              attr_name: attr_group_list[i].attr_list[j].attr_name,
            };
            break;
          }
        }
        checked_attr_list.push({
          attr_group_name: attr_group_list[i].attr_group_name,
          attr_name: attr.attr_name,
        });
      }
     
      var attrTemp = self.data.attr;
      let length = checked_attr_list.length;
      for (var i in attrTemp) {
        var tempnum = 0;
        for (var j in checked_attr_list) {
          if (checked_attr_list[j].attr_name != attrTemp[i].attr_list[j].attr_name) {
            break
          } else {
            tempnum++
          }
        }
        if (tempnum == length) {
         
          let goods = self.data.goods;
          if (self.data.attr[i].pic) {
            goods.attr_pic = self.data.attr[i].pic;
          }   
          goods.num = self.data.attr[i].num;
          goods.sku = self.data.attr[i].sku;
          for (var m in self.data.pt_attr) {
            if (self.data.pt_attr[m].sku == goods.sku) {
              goods.price = self.data.pt_attr[m].price;
              goods.origin_price = self.data.attr[m].va
            }
          }
          self.setData({
            goods: goods
          })
        }
      }
    }
  },
    /**
     * 参团
     */
    buyNow: function() {
        this.submit('GROUP_BUY_C');
    },
    /**
     * 订单提交
     */
    submit: function(type) {
        var self = this;
        if (!self.data.show_attr_picker) {
            self.setData({
                show_attr_picker: true,
            });
			this.selectDefaultAttr()
            return true;
        }

        if (self.data.form.number > self.data.goods.num) {
            getApp().core.showToast({
                title: "商品库存不足，请选择其它规格或数量",
                image: "/images/icon-warning.png",
            });
            return true;
        }
        // var attr_group_list = self.data.attr_group_list;
        // var checked_attr_list = [];
        // for (var i in attr_group_list) {
        //     var attr = false;
        //     for (var j in attr_group_list[i].attr_list) {
        //         if (attr_group_list[i].attr_list[j].checked) {
        //             attr = {
        //                 attr_id: attr_group_list[i].attr_list[j].attr_id,
        //                 attr_name: attr_group_list[i].attr_list[j].attr_name,
        //             };
        //             break;
        //         }
        //     }
        //     if (!attr) {
        //         getApp().core.showToast({
        //             title: "请选择" + attr_group_list[i].attr_group_name,
        //             image: "/images/icon-warning.png",
        //         });
        //         return true;
        //     } else {
        //         checked_attr_list.push({
        //             attr_group_id: attr_group_list[i].attr_group_id,
        //             attr_group_name: attr_group_list[i].attr_group_name,
        //             attr_id: attr.attr_id,
        //             attr_name: attr.attr_name,
        //         });
        //     }
        // }

        self.setData({
            show_attr_picker: false,
        });

        var goods_list = [];
        goods_list.push({
            // deliver_type: self.data.goods.type,
            goods_id: self.data.goods.id,
            num: self.data.form.number,
            sku: self.data.goods.sku,
            type: type,
            from: 3,
            group_id: 0,
            parent_id: self.data.oid,
        });
        var goods = self.data.goods;
        var mch_id = 0;
        if (goods.mch != null) {
            mch_id = goods.mch.id
        }
        var mch_list = [];
        mch_list.push({
            mch_id: mch_id,
            goods_list: goods_list
        });

        getApp().core.redirectTo({
            url: "/pages/new-order-submit/new-order-submit?mch_list=" + JSON.stringify(mch_list),
        });
    },
    numberSub: function() {
        var self = this;
        var num = self.data.form.number;
        if (num <= 1)
            return true;
        num--;
        self.setData({
            form: {
                number: num,
            }
        });
    },
    numberAdd: function() {
        var self = this;
        var num = self.data.form.number;
        num++;
        if (num > self.data.goods.one_buy_limit && self.data.goods.one_buy_limit != 0) {
            getApp().core.showModal({
                title: '提示',
                content: '最多只允许购买' + self.data.goods.one_buy_limit,
                showCancel: false,
            });
            return;
        }
        if (num > self.data.goods.buy_limit && self.data.goods.buy_limit != 0) {
          getApp().core.showModal({
            title: '提示',
            content: '数量超过最大限购数',
            showCancel: false,
            success: function (res) { }
          })
          return;
        }
        self.setData({
            form: {
                number: num,
            }
        });
    },
    numberBlur: function(e) {
        var self = this;
        var num = e.detail.value;
        num = parseInt(num);
        if (isNaN(num))
            num = 1;
        if (num <= 0)
            num = 1;
        if (num > self.data.goods.one_buy_limit && self.data.goods.one_buy_limit != 0) {
            getApp().core.showModal({
                title: '提示',
                content: '最多只允许购买' + self.data.goods.one_buy_limit + '件',
                showCancel: false,
            });
            self.setData({
                form: {
                    number: num,
                }
            });
            return;
        }
        if (num > self.data.goods.buy_limit && self.data.goods.buy_limit != 0) {
          getApp().core.showModal({
            title: '提示',
            content: '数量超过最大限购数',
            showCancel: false,
            success: function (res) { }
          })
          return;
        }
        self.setData({
            form: {
                number: num,
            }
        });
    },
    /**
     * 拼团规则
     */
    goArticle: function(e) {
        if (this.data.group_rule_id) {
            getApp().core.navigateTo({
                url: '/pages/article-detail/article-detail?id=' + this.data.group_rule_id,
            });
        };
    },
   
	/**
	 * 无规格、默认选中
	 */
	selectDefaultAttr: function() {
		var self = this;
		var goods_attr = self.data.attr
		var attr_group_list = self.data.attr_group_list
		for (var i in attr_group_list) {
			for (var j in attr_group_list[i].attr_list) {
				if (j == 0)
					attr_group_list[i].attr_list[j]['checked'] = true;
			}
		}
	
		let goods = self.data.goods;
		goods.attr_pic = goods_attr[0].pic;
		goods.num = goods_attr[0].num;
		if (self.data.form.number && self.data.form.number>goods.num) {
			self.setData({
				form: {
					number: goods.num,
				}
			});
			if (goods.num==0) {
				self.setData({
					form: {
						number: 1,
					}
				});
			}
		}
		goods.c1 = goods_attr[0].c1;
		goods.sku = goods_attr[0].sku;
		goods.price = goods_attr[0].price;
		goods.attr_list = goods_attr[0].attr_list;
		goods.original_price = goods_attr[0].va;
		self.setData({
			goods: goods,
			attr_group_list: self.data.attr_group_list
		});
	},
})