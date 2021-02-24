// components/select/select.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        //数据默认值
        arrData: {
            type: Array,
            value: []
        },
        //选择字段
        selectString: {
            type: String,
            value: 'name'
        },
        //是否显示组件
        isShow: {
            type: Boolean,
            value: false
        },
        //搜索框默认文字
        inputText: {
            type: String,
            value: '请输入顾客昵称'
        },
        //标题
        title: {
            type: String,
            value: '顾客昵称'
        },
        //搜索内容为空，是否显示文字提示
        showNone: {
            type: Boolean,
            value: false
        },
		selectType: {
			type: Number,
			value: 1
		},
		// 有时，把数据传进来
		checkArr: {
			type: Array,
			value: []
		},
		// 
		checkArrName: {
			type: Array,
			value: []
		}
    },
    options: {
        addGlobalClass: true
    },
    /**
     * 组件的初始数据
     */
    data: {
        //加载更多
        moreTime: true,
        inputValue: '', //input的值
        addValue: 0,
        nameLength: 10
    },

    /**
     * 组件的方法列表
     */
    methods: {
        stop: function() {

        },
        //取消
        quxiao() {
            this.triggerEvent('quxiao', {})
        },
        //点击添加按钮
        add(e) {
            this.data.checkArr.push(e.currentTarget.dataset.id);
        	this.data.checkArrName.push(e.currentTarget.dataset.name);
            this.setData({
                checkArr: this.data.checkArr,
        		checkArrName: this.data.checkArrName
            })
        },
        del (e) {
        	this.data.checkArr.splice(e.currentTarget.dataset.index,1)
        	this.data.checkArrName.splice(e.currentTarget.dataset.index,1);
        	this.setData({
        	    checkArr: this.data.checkArr,
        		checkArrName: this.data.checkArrName
        	})
        },
		// addBrand () {
		// 	getApp().request({
		// 		url: getApp().api.maijia.add_brand,
		// 		method: 'POST',
		// 		data: {
		// 			brand_ids: this.data.checkArr,
		// 			// user_ids: 
		// 		},
		// 		success: (res) => {
		// 			console.log(res);
		// 			if (res.code == 0) {
		// 				this.getBrandList()
		// 			}
		// 		}
		// 	})
		// },
        //加载下一页
        more(e) {
            if (this.data.moreTime) {
                this.setData({
                    moreTime: false
                })
                this.setData({
                    nameLength: this.data.nameLength + 10
                })
				this.triggerEvent('getmore')
                setTimeout(() => {
                    this.setData({
                        moreTime: true
                    })
                }, 10)
            }

        },
        //input框值发生改变
        inputChange(e) {
            //console.log(e.detail.value)
                this.setData({
                    inputValue: e.detail.value
                })
				var searchValue = {
					keyword: e.detail.value
				}
				this.triggerEvent('search',searchValue)
        },
        //点击确定按钮
        sure() {
			var myDetail = {
				checkArr: this.data.checkArr,
				checkArrName: this.data.checkArrName
			} 
			this.triggerEvent('binddata',myDetail)
			this.quxiao()
        }

    },
    ready: function() {


    },
    /*组件所在页面的生命周期 */


    /*组件生命周期*/
    lifetimes: {
        created() {
            // console.log("在组件实例刚刚被创建时执行")
            // console.log(this.properties.arrData)

        },
        attached() {
            // console.log("在组件实例进入页面节点树时执行")
            // console.log(this.properties.arrData)
        },
        ready() {
            // console.log("在组件在视图层布局完成后执行")
            // console.log(this.properties.arrData)

        },
        moved() {
            // console.log("在组件实例被移动到节点树另一个位置时执行")
        },
        detached() {
            // console.log("在组件实例被从页面节点树移除时执行")
        },
        error() {
            // console.log("每当组件方法抛出错误时执行")
        },
        /*组件所在页面的生命周期 */
        pageLifetimes: {
            show: function() {
                // 页面被展示
                console.log("页面被展示")
            },
            hide: function() {
                // 页面被隐藏
                console.log("页面被隐藏")
            },
            resize: function(size) {
                // 页面尺寸变化
                console.log("页面尺寸变化")
            }
        }

    }
})