// pages/doorToTake/doorToTake.js
var area_picker = require('./../../components/area-picker/area-picker.js');
import util from '../../utils/util.js'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		town_index: 0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var self = this;
		self.getDistrictData(function(data) {
			area_picker.init({
				page: self,
				data: data,
			});
		});
	},
	getDistrictData: function(cb) {
		var district = getApp().core.getStorageSync(getApp().const.DISTRICT);
		if (!district) {
			getApp().core.showLoading({
				title: "正在加载",
				mask: true,
			});
			getApp().request({
				url: getApp().api.default.district,
				success: function(res) {
					getApp().core.hideLoading();
					if (res.code == 0) {
						district = res.data;
						getApp().core.setStorageSync(getApp().const.DISTRICT, district);
						cb(district);
					}
				}
			});
			return;
		}
		cb(district);
	},
	
	onAreaPickerConfirm: function(e) {
		var self = this;
		var district_id = e[2].id
		self.setData({
			district: {
				province: {
					id: e[0].id,
					name: e[0].name,
				},
				city: {
					id: e[1].id,
					name: e[1].name,
				},
				district: {
					id: e[2].id,
					name: e[2].name,
				},
			}
		});
		if (district_id) {
			getApp().request({
				url: getApp().api.default.son_district,
				data: {
					id: district_id
				},
				success: (res) => {
					var district = self.data.district
					if (res.code == 0) {
						var town_list = res.data
						district.town = {}
						district.town.id = town_list[self.data.town_index].id
						district.town.name = town_list[self.data.town_index].name
						self.setData({
							town_list: res.data,
							district: district
						})
					}
				}
			})
		}
		
	},
	townAreaPick (e) {
		var town_list = this.data.town_list
		var district = this.data.district
		district.town = {}
		district.town.id = town_list[e.detail.value].id
		district.town.name = town_list[e.detail.value].name
		this.setData({
			town_index: e.detail.value,
			district: district
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
	onShareAppMessage: function() {

	}
})
