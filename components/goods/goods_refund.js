module.exports = {
	currentPage: null,
	/**
	 * 注意！注意！！注意！！！
	 * 由于组件的通用，部分变量名称需统一，在各自引用的xxx.js文件需定义，并给对应变量赋相应的值
	 * 以下变量必须定义并赋值
	 * 
	 * pageType 页面标识，从哪个页面引用
	 * order_detail_id  订单ID
	 * 持续补充...
	 */
	init: function(self) {
		var _this = this;
		_this.currentPage = self;

		if (typeof self.switchTab === 'undefined') {
			self.switchTab = function(e) {
				_this.switchTab(e);
			}
		}
		if (typeof self.descInput === 'undefined') {
			self.descInput = function(e) {
				_this.descInput(e);
			}
		}
		if (typeof self.chooseImage === 'undefined') {
			self.chooseImage = function(e) {
				_this.chooseImage(e);
			}
		}
		if (typeof self.deleteImage === 'undefined') {
			self.deleteImage = function(e) {
				_this.deleteImage(e);
			}
		}
		if (typeof self.refundSubmit === 'undefined') {
			self.refundSubmit = function(e) {
				_this.refundSubmit(e);
			}
		}
	},
	descInput: function(e) {
		var self = this.currentPage;
		var value = e.detail.value;
		var refund_data = self.data.refund_data;
		refund_data.desc = value;
		self.setData({
			refund_data: refund_data,
		});
	},

	chooseImage: function(e) {
		var self = this.currentPage;
		var type = e.currentTarget.dataset.type;
		var max_pic_num = 3;
		var refund_data = self.data.refund_data;
		var pic_num = 0;
		if (refund_data.pic_list)
			pic_num = refund_data.pic_list.length || 0;
		var _count = max_pic_num - pic_num;
		getApp().core.chooseImage({
			count: _count,
			success: function(res) {
				if (!refund_data.pic_list)
					refund_data.pic_list = [];
				refund_data.pic_list = refund_data.pic_list.concat(res.tempFilePaths);
				self.setData({
					refund_data: refund_data
				});
			}
		});
	},
	deleteImage: function(e) {
		var self = this.currentPage;
		var type = e.currentTarget.dataset.type;
		var index = e.currentTarget.dataset.index;
		var refund_data = self.data.refund_data;
		refund_data.pic_list.splice(index, 1);
		self.setData({
			refund_data: refund_data
		});
	},
	refundSubmit: function(e) {
		var self = this.currentPage;
		var form_id = e.detail.formId;
		
		// if (self.data.refundIndex) {
		// 	var type = self.data.refundType[self.data.refundIndex].id 
		// } else {
		// 	wx.showToast({
		// 		title: '请选择退款类型',
		// 		icon: 'none'
		// 	})
		// 	return
		// }
		if(self.data.refund_type_id) {
			var type = self.data.refund_type_id
		} else {
			wx.showToast({
				title: '请选择退款类型',
				icon: 'none'
			})
			return
		 }
		
		var pic_url_list = [];
		var pic_complete_count = 0;
		var pageType = self.data.pageType;
		var httpUrl = getApp().api.order.refund;
		var navigateToUrl = '';
		var orderType = '';

		if (pageType === 'STORE') {
			navigateToUrl = '/pages/refund/refund?status=4';
			orderType = 'STORE';

		} else if (pageType === 'PINTUAN') {
			navigateToUrl = '/pages/pt/order/order?status=4';
			orderType = 'PINTUAN';

		} else if (pageType === 'MIAOSHA') {
			navigateToUrl = '/pages/miaosha/order/order?status=4';
			orderType = 'MIAOSHA';

		} else {
			getApp().core.showModal({
				title: '提示',
				content: 'pageType变量未定义或变量值不是预期的',
			});
			return;

		}

		/*--退货退款开始--*/
		// if (type == 1) { //退货退款
			var desc = self.data.refund_data.desc || "";
			
			// if (desc.length == 0) {
			//     getApp().core.showToast({
			//         title: "请填写退货原因",
			//         image: "/images/icon-warning.png",
			//     });
			//     return;
			// }

			//如果有图片先上传图片
			if (self.data.refund_data.pic_list && self.data.refund_data.pic_list.length > 0) {
				getApp().core.showLoading({
					title: "正在上传图片",
					mask: true,
				});
				for (var i in self.data.refund_data.pic_list) {
					(function(i) {
						getApp().core.uploadFile({
							url: getApp().api.default.upload_image,
							filePath: self.data.refund_data.pic_list[i],
							name: "image",
							success: function(res) {
								pic_complete_count++;
								if (res.statusCode == 200) {
									res = JSON.parse(res.data);
									if (res.code == 0) {
										pic_url_list[i] = res.data.url;
									}
									if (res.code == 1) {
										wx.showModal({
											title: res.msg,
											showCancel: false,
											icon: 'none'
										})
										return;
									}
								}
								if (pic_complete_count == self.data.refund_data.pic_list.length) {
									getApp().core.hideLoading();
									_submit();
								}
							},
							complete: function(res) {
								getApp().core.hideLoading();
							}
						});
					})(i);
				}
			} else {
				_submit();
			}

			function _submit() {
				getApp().core.showLoading({
					title: "正在提交",
					mask: true,
				});
				var type = self.data.type
				var data = {
					
				}
				if (type == 1) {
					var data = {
						type: type,
						order_detail_id: self.data.goods.order_detail_id,
						desc: desc,
						pic_list: JSON.stringify(pic_url_list),
						form_id: form_id,
						orderType: orderType,
						// reasons_for_return: self.data.returnIndex ? self.data.returnCause[self.data.returnIndex].id : '',
						reasons_for_return: self.data.tuikuangIndex ? self.data.tuikuangCause[self.data.tuikuangIndex].id : '',
						packageDesc: self.data.packagingIns,
						isHasPackage: self.data.packageIns,
						isNeedDetectionReport: self.data.checkIns,
						reason_comp: self.data.reason_comp,
						refund_num: self.data.refund_num,
						returnwareType: self.data.aogIns
					}
				} else {
					var data = {
						type: type,
						order_detail_id: self.data.goods.order_detail_id,
						desc: desc,
						pic_list: JSON.stringify(pic_url_list),
						form_id: form_id,
						orderType: orderType,
						// reasons_for_return: self.data.returnIndex ? self.data.returnCause[self.data.returnIndex].id : '',
						reason_for_return: self.data.tuikuangIndex ? self.data.tuikuangCause[self.data.tuikuangIndex].id : '',
						
						packageDesc: self.data.packagingIns,
						isHasPackage: self.data.packageIns,
						isNeedDetectionReport: self.data.checkIns,
						reason_comp: self.data.reason_comp,
						refund_num: self.data.refund_num,
						returnwareType: self.data.aogIns
					}
				}
				getApp().request({
					url: httpUrl,
					method: "post",
					data: data,
					success: function(res) {
						var request_res = res
						getApp().core.hideLoading();

						if (res.code == 0) {
							wx.requestSubscribeMessage({
								tmplIds: [self.data.refundId, self.data.sendId],
								success: function(res) {
								},
								complete: function(res) {
									getApp().core.showModal({
										title: "提示",
										content: request_res.msg,
										showCancel: false,
										success: function(res) {
											if (res.confirm) {
												getApp().core.redirectTo({
													url: navigateToUrl
												});
											}
										}
									});
								}
							})

						}
						if (res.code == 1) {
							getApp().core.showModal({
								title: "提示",
								content: res.msg,
								showCancel: false,
								success: function(res) {
									// if (res.confirm) {
									// 	getApp().core.navigateBack({
									// 		delta: 2,
									// 	});
									// }
								}
							});
						}
					}
				});
			}
		// }
		/*--退货退款结束--*/


		/*--退款开始--*/
		// if (type == 3) { //换货
		// 	var desc = self.data.refund_data_2.desc || "";
		// 	// if (desc.length == 0) {
		// 	//     getApp().core.showToast({
		// 	//         title: "请填写退款说明",
		// 	//         image: "/images/icon-warning.png",
		// 	//     });
		// 	//     return;
		// 	// }
		// 	var pic_url_list = [];
		// 	var pic_complete_count = 0;

		// 	//如果有图片先上传图片
		// 	if (self.data.refund_data_2.pic_list && self.data.refund_data_2.pic_list.length > 0) {
		// 		getApp().core.showLoading({
		// 			title: "正在上传图片",
		// 			mask: true,
		// 		});
		// 		for (var i in self.data.refund_data_2.pic_list) {
		// 			(function(i) {
		// 				getApp().core.uploadFile({
		// 					url: getApp().api.default.upload_image,
		// 					filePath: self.data.refund_data_2.pic_list[i],
		// 					name: "image",
		// 					success: function(res) {
		// 						pic_complete_count++;
		// 						if (res.statusCode == 200) {
		// 							res = JSON.parse(res.data);
		// 							if (res.code == 0) {
		// 								pic_url_list[i] = res.data.url;
		// 							}
		// 							if (res.code == 1) {
		// 								wx.showModal({
		// 									title: res.msg,
		// 									showCancel: false,
		// 									icon: 'none'
		// 								})
		// 							}
		// 						}
		// 						if (pic_complete_count == self.data.refund_data_2.pic_list.length) {
		// 							getApp().core.hideLoading();
		// 							_submit();
		// 						}
		// 					},
		// 					complete: function(res) {
		// 						getApp().core.hideLoading();
		// 					}
		// 				});
		// 			})(i);
		// 		}
		// 	} else {
		// 		_submit();
		// 	}

		// 	function _submit() {
		// 		getApp().core.showLoading({
		// 			title: "正在提交",
		// 			mask: true,
		// 		});

		// 		getApp().request({
		// 			url: httpUrl,
		// 			method: "post",
		// 			data: {
		// 				type: 3,
		// 				order_detail_id: self.data.goods.order_detail_id,
		// 				desc: desc,
		// 				pic_list: JSON.stringify(pic_url_list),
		// 				receipt_status: self.data.reciveIndex ? self.data.reciveStatus[self.data.reciveIndex].id : '',
		// 				reason_for_return: self.data.tuikuangIndex ? self.data.tuikuangCause[self.data.tuikuangIndex].id : ''
		// 			},
		// 			success: function(res) {
		// 				var request_res = res
		// 				getApp().core.hideLoading();
		// 				if (res.code == 0) {
		// 					wx.requestSubscribeMessage({
		// 						tmplIds: [self.data.refundId, self.data.sendId],
		// 						success: function(res) {
		// 							console.log(res);
		// 						},
		// 						complete: function(res) {
		// 							getApp().core.showModal({
		// 								title: "提示",
		// 								content: request_res.msg,
		// 								showCancel: false,
		// 								success: function(res) {
		// 									if (res.confirm) {
		// 										getApp().core.redirectTo({
		// 											url: navigateToUrl
		// 										});
		// 									}
		// 								}
		// 							});
		// 						}
		// 					})
		// 				}
		// 				if (res.code == 1) {
		// 					getApp().core.showModal({
		// 						title: "提示",
		// 						content: res.msg,
		// 						showCancel: false,
		// 						success: function(res) {
		// 							if (res.confirm) {
		// 								// getApp().core.navigateBack({
		// 								// 	delta: 2,
		// 								// });
		// 							}
		// 						}
		// 					});
		// 				}
		// 			}
		// 		});
		// 	}
		// }
		/*--退款结束--*/
	}
}
