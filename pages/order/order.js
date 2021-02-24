// order.js
var app = getApp();
var api = getApp().api;
var is_no_more = false;
var is_loading = false;
var p = 2;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        statusBar: getApp().globalData.statusBar,
        customBar: getApp().globalData.customBar,
        custom: getApp().globalData.custom,
        y: getApp().core.getSystemInfoSync().windowHeight,
        status: -1,
        order_list: [],
        show_no_data_tip: true,
        hide: 1,
        qrcode: "",
        cancelCauseList: [],
        isCancelOrder: false,
        cancelIns: -1,
        order_id: 0,
        isRemind: false,
        orderAll: [],
        page: 1,
        stopLoadMore: false,
        refundId: getApp().core.getStorageSync('refundId'),
        sendId: getApp().core.getStorageSync('sendId'),
        keyword: '', //搜索值

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        getApp().page.onLoad(this, options);
        var self = this;
        is_no_more = false;
        is_loading = false;
        p = 2;
        let status_0 = 0;
        if (options.status_0) {
            status_0 = options.status_0
        }

        self.setData({
            options: options,
            status_0: status_0
        });
        self.loadOrderList(options.status || -1);
        var pages = getCurrentPages();
        if (pages.length < 2) {
            self.setData({
                show_index: true,
            });
        }
    },
    openPickCode(e) {
        this.setData({
            is_code: true
        })
        var pick_order_id = e.currentTarget.dataset.id
        getApp().request({
            url: getApp().api.group.pick_qrcode,
            data: {
                userId: getApp().core.getStorageSync('USER_INFO').id,
                order_id: pick_order_id
            },
            success: (res) => {
                if (res.code == 0) {
                    this.setData({
                        qrcode_pic: res.data.qrcode_pic,
                        pickName: res.data.zt_address_data.dispatching_name,
                        codeNo: res.data.order_id
                    })
                } else {
                    wx.showModal({
                        title: res.msg,
                        showCancel: false
                    })
                }
            }
        })
    },
    closePickCode() {
        this.setData({
            is_code: false
        })
    },
    buyAgain: function(e) {
        var self = this

        var order_no = e.currentTarget.dataset.no
        getApp().request({
            url: getApp().api.order.buy_again,
            method: 'POST',
            data: {
                order_no: order_no
            },
            success: function(res) {
                if (res.code == 0) {

                }
            }
        })
        wx.navigateTo({
            url: '/pages/cart/cart'
        })
    },
    loadOrderList: function(status) {
        if (status == undefined)
            status = -1;
        var self = this;
        self.setData({
            status: status,
        });
        getApp().core.showLoading({
            title: "正在加载",
            mask: true,
        });
        var data = {
            status: self.data.status,
            keyword: self.data.keyword
        };
        var options = self.data.options;
        if (typeof self.data.options.order_id !== 'undefined') {
            data.order_id = self.data.options.order_id
        }
        getApp().request({
            url: getApp().api.order.detail_list,
            data: data,
            success: function(res) {
                if (res.code == 0) {
                    self.setData({
                        order_list: res.data.list,
                        orderAll: res.data,
                        cancelCauseList: res.data.cancel_order_options,
                        // pay_type_list: res.data.pay_type_list
                        count: res.data.row_count
                    });
                    var item = getApp().core.getStorageSync(getApp().const.ITEM);
                    if (item) {
                        getApp().core.removeStorageSync(getApp().const.ITEM);
                    }
                }
                if (self.data.order_list) {
                    self.setData({
                        show_no_data_tip: (self.data.order_list.length == 0),
                    });
                }

            },
            complete: function() {
                getApp().core.hideLoading();
                getApp().core.stopPullDownRefresh();
            }
        });
    },


    onReachBottom: function() {
        var self = this;
        // if (is_loading || is_no_more)
        // 	return;
        // is_loading = true;
        var page = self.data.page
        if (self.data.stopLoadMore == true) {
            return
        }

        ++page
        self.setData({
            page: page
        })


        getApp().core.showLoading({
            title: '加载中'
        })
        getApp().request({
            url: getApp().api.order.detail_list,
            data: {
                status: self.data.status,
                page: page,
                keyword: self.data.keyword
            },
            success: function(res) {
                if (res.code == 0) {

                    var order_list = self.data.order_list.concat(res.data.list);
                    if (res.data.list.length == 0) {
                        self.setData({
                            stopLoadMore: true
                        })
                        return
                    }
                    self.setData({
                        order_list: order_list,
                        pay_type_list: res.data.pay_type_list
                    });
                    // if (res.data.list.length == 0) {
                    // 	is_no_more = true;
                    // }
                }

            },
            complete: function() {
                getApp().core.hideLoading()
                is_loading = false;
            }
        });
    },

    /**
     * 已废弃
     * 新支付接口在/commons/order-pay/order-pay.js
     */
    orderPay_1: function(e) {
        var self = this;
        var pay_type_list = self.data.pay_type_list;
        if (pay_type_list.length == 1) {
            getApp().core.showLoading({
                title: "正在提交",
                mask: true,
            });
            if (pay_type_list[0]['payment'] == 0) {
                self.WechatPay(e);
            }
            if (pay_type_list[0]['payment'] == 3) {
                self.BalancePay(e);
            }
        } else {
            getApp().core.showModal({
                title: '提示',
                content: '选择支付方式',
                cancelText: '余额支付',
                confirmText: '线上支付',
                success: function(res) {
                    getApp().core.showLoading({
                        title: "正在提交",
                        mask: true,
                    });
                    if (res.confirm) {
                        self.WechatPay(e);
                    } else if (res.cancel) {
                        self.BalancePay(e);
                    }
                }
            })
        }
    },
    // 提醒发货按钮
    openRemind: function(e) {
        var self = this


        getApp().core.showLoading({
            title: "操作中",
        });
        getApp().request({
            url: getApp().api.order.urge_send,
            data: {
                order_no: e.currentTarget.dataset.id,
            },
            success: function(res) {
                getApp().core.hideLoading();
                self.setData({
                    isRemind: true
                })
            }
        });
    },
    // 开去发货提醒按钮
    remindBtn: function() {
        var self = this

        wx.requestSubscribeMessage({
            tmplIds: [self.data.sendId, self.data.refundId],
            success: function(res) {}
        })
        self.setData({
            isRemind: false
        })

    },
    closeRemind: function() {
        var self = this
        self.setData({
            isRemind: false
        })
    },
    WechatPay: function(e) {
        getApp().request({
            url: getApp().api.order.pay_data,
            data: {
                order_id: e.currentTarget.dataset.id,
                pay_type: "WECHAT_PAY",
            },
            complete: function() {
                getApp().core.hideLoading();
            },
            success: function(res) {
                if (res.code == 0) {
                    getApp().core.requestPayment({
                        _res: res,
                        timeStamp: res.data.timeStamp,
                        nonceStr: res.data.nonceStr,
                        package: res.data.package,
                        signType: res.data.signType,
                        paySign: res.data.paySign,
                        success: function(e) {},
                        fail: function(e) {},
                        complete: function(e) {

                            if (e.errMsg == "requestPayment:fail" || e.errMsg == "requestPayment:fail cancel") { //支付失败转到待支付订单列表
                                getApp().core.showModal({
                                    title: "提示",
                                    content: "订单尚未支付",
                                    showCancel: false,
                                    confirmText: "确认",
                                    success: function(res) {
                                        if (res.confirm) {
                                            getApp().core.redirectTo({
                                                url: "/pages/order/order?status=0",
                                            });
                                        }
                                    }
                                });
                                return;
                            }
                            getApp().core.redirectTo({
                                url: "/pages/order/order?status=1",
                            });
                        },
                    });
                }
                if (res.code == 1) {
                    getApp().core.showToast({
                        title: res.msg,
                        image: "/images/icon-warning.png",
                    });
                }
            }
        });
    },

    BalancePay: function(e) {

        getApp().request({
            url: getApp().api.order.pay_data,
            data: {
                order_id: e.currentTarget.dataset.id,
                pay_type: "BALANCE_PAY",
            },
            complete: function() {
                getApp().core.hideLoading();
            },
            success: function(res) {
                if (res.code == 0) {
                    getApp().core.redirectTo({
                        url: "/pages/order/order?status=1",
                    });
                }
                if (res.code == 1) {
                    getApp().core.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false
                    })
                }
            }
        });
    },

    orderRevoke: function(e) {
        var self = this;

        this.setData({
            isCancelOrder: true,
            order_id: e.currentTarget.dataset.id,
        })

    },
    chooseCause: function(e) {
        var self = this
        var index = e.currentTarget.dataset.index
        var text = e.currentTarget.dataset.text
        var ins = self.data.cancelIns
        self.setData({
            cancelIns: index,
            cancelText: text
        })
    },
    cancelOrder: function() {
        var self = this
        var ins = self.data.cancelIns
        if (ins == '-1') {
            getApp().core.showModal({
                title: "提示",
                content: '请选择原因',
            });
        } else {
            getApp().core.showLoading({
                title: "操作中",
            });
            getApp().request({
                url: getApp().api.order.revoke,
                data: {
                    order_id: self.data.order_id,
                    cancel_order_options: self.data.cancelText
                },
                success: function(res) {
                    self.setData({
                        isCancelOrder: false,
                        cancelIns: -1
                    })
                    getApp().core.hideLoading();
                    getApp().core.showModal({
                        title: "提示",
                        content: res.msg,
                        showCancel: false,
                        success: function(res) {
                            if (res.confirm) {
                                self.loadOrderList(self.data.status);
                            }
                        }
                    });
                }
            });
        }
    },
    cancelCancelOrder: function() {
        this.setData({
            isCancelOrder: false,
        })
    },

    orderConfirm: function(e) {
        var self = this;
        getApp().core.showModal({
            title: "提示",
            content: "是否确认已收到货？",
            cancelText: "否",
            confirmText: "是",
            success: function(res) {
                if (res.cancel)
                    return true;
                if (res.confirm) {
                    getApp().core.showLoading({
                        title: "操作中",
                    });
                    getApp().request({
                        url: getApp().api.order.confirm,
                        data: {
                            order_id: e.currentTarget.dataset.id,
                        },
                        success: function(res) {
                            getApp().core.hideLoading();
                            getApp().core.showToast({
                                title: res.msg,
                            });
                            if (res.code == 0) {
                                self.loadOrderList(3);
                            }
                        }
                    });
                }
            }
        });
    },
    orderQrcode: function(e) {
        var self = this;
        var order_list = self.data.order_list;
        var index = e.target.dataset.index;
        getApp().core.showLoading({
            title: "正在加载",
            mask: true,
        });
        if (self.data.order_list[index].offline_qrcode) {
            self.setData({
                hide: 0,
                qrcode: self.data.order_list[index].offline_qrcode
            });
            getApp().core.hideLoading();
        } else {
            getApp().request({
                url: getApp().api.order.get_qrcode,
                data: {
                    order_no: order_list[index].order_no
                },
                success: function(res) {
                    if (res.code == 0) {
                        self.setData({
                            hide: 0,
                            qrcode: res.data.url
                        });
                    } else {
                        getApp().core.showModal({
                            title: '提示',
                            content: res.msg,
                        })
                    }
                },
                complete: function() {
                    getApp().core.hideLoading();
                }
            });
        }
    },
    hide: function(e) {
        this.setData({
            hide: 1
        });
    },
    onShow: function() {
        getApp().page.onShow(this);
    },
    changeNav: function(e) {
        let status = e.currentTarget.dataset.status
        this.setData({
            status: status,
            stopLoadMore: false,
            page: 1
        })
        this.loadOrderList(status)
    },
    onPullDownRefresh() {
        var status = this.data.status
        this.loadOrderList(status)
        this.setData({
            page: 1
        })
    },
    //input值改变
    inputChange(e) {
        //console.log(e.detail.value);
        this.setData({
            keyword: e.detail.value
        });
    },
    //input失去焦点
    inputBlur(e) {
        //console.log('失去焦点');
        if (this.data.keyword) {

        }
        this.setData({
                page: 1
            })
            //执行条件搜索
        this.loadOrderList(this.data.status)
    },
    //删除input值
    deleteInput(e) {
        this.setData({
            keyword: ''
        });
        this.setData({
                page: 1
            })
            //执行条件搜索
        this.loadOrderList(this.data.status)
    },
    //返回
    goback() {
		var pageRoute = getCurrentPages()
		var routeLength = getCurrentPages().length
		var frontRoute = pageRoute[routeLength - 2].route
		if (frontRoute == 'pages/cart/cart') {
			wx.redirectTo({
				url: '/pages/cart/cart'
			})
		} else {
			wx.navigateBack({
			    delta: 1
			});
		}
    }
});