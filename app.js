// 不要删这行注释：siteInfo: require('siteinfo.js')
// const ald = require('./utils/ald-stat.js');
let livePlayer = requirePlugin('live-player-plugin')
let platform = null;
if (typeof wx !== 'undefined') {
	platform = 'wx';
}
if (typeof my !== 'undefined') {
	platform = 'my';
}

/***
 * 加载的模块请在这里配置
 * @type {*[]}
 */
let modules = [{
		name: 'helper',
		file: './utils/helper.js',
	},
	{
		name: 'const',
		file: './core/const.js',
	},
	{
		name: 'envInfo',
		file: './siteinfo.js',
	},
	{
		name: 'getConfig',
		file: './core/config.js',
	},
	{
		name: 'page',
		file: './core/page.js',
	},
	{
		name: 'request',
		file: './core/request.js',
	},
	{
		name: 'core',
		file: './core/core.js',
	},
	{
		name: 'api',
		file: './core/api.js',
	},
	{
		name: 'getUser',
		file: './core/getUser.js',
	},
	{
		name: 'setUser',
		file: './core/setUser.js',
	},
	{
		name: 'login',
		file: './core/login.js',
	},
	{
		name: 'trigger',
		file: './core/trigger.js',
	},
	{
		name: 'uploader',
		file: './utils/uploader.js',
	},
	{
		name: 'orderPay',
		file: './core/order-pay.js',
	}
];

/***
 * App对象配置
 * @type {{onLaunch: args.onLaunch, onShow: args.onShow}}
 */
let args = {
	_version: "2.10.1",
	platform: platform,
	query: null,
	onLaunch: function() {
		wx.getSystemInfo({
			success: e => {
				this.globalData.statusBar = e.statusBarHeight; //状态栏高度
				let custom = wx.getMenuButtonBoundingClientRect(); //菜单按钮
				this.globalData.custom = custom;
				this.globalData.customBar = custom.bottom + custom.top - e.statusBarHeight;
				//计算得到定义的状态栏高度
			}
		})
	},
	globalData: {},
	onShow: function(e) {
		this.checkUpdate();
		if (e.scene)
			this.onShowData = e;
		if (e && e.query) {
			this.query = e.query
		}
		if (this.getUser()) {
			this.trigger.run(this.trigger.events.login);
		}
		// 分享卡片入口场景才调用getShareParams接口获取以下参数
		if (e.scene == 1007 || e.scene == 1008 || e.scene == 1044 ) {
			livePlayer.getShareParams()
				.then(res => {
					this.mch_id = res.custom_params.mch_id
					this.user_id = res.custom_params.user_id
					getApp().page.onLoad(this, res.custom_params);
				}).catch(err => {
					console.log('get share params', err)
				})
		}
	},
	is_login: false,
	login_complete: false,
	is_form_id_request: true,
	showCoupon: true
};
for (let i in modules) {
	args[modules[i].name] = require('' + modules[i].file);
}

var _web_root = args.api.index.substr(0, args.api.index.indexOf('/index.php'));
args.webRoot = _web_root;
args.getauth = function(object) {
	var app = this;
	if (app.platform == 'my') {
		if (object.success) {
			var res = {
				authSetting: {}
			}
			res.authSetting[object.author] = true;
			object.success(res);
		}
	} else {
		app.core.getSetting({
			success: function(res) {
				if (typeof res.authSetting[object.author] === 'undefined') {
					app.core.authorize({
						scope: object.author,
						success: function(res) {
							if (object.success) {
								object.success(res);
							}
						}
					});
				} else if (res.authSetting[object.author] == false) {
					app.core.showModal({
						title: '是否打开设置页面重新授权',
						content: object.content,
						confirmText: '去设置',
						success: function(e) {
							if (e.confirm) {
								app.core.openSetting({
									success: function(res) {
										if (object.success) {
											object.success(res);
										}
									},
									fail: function(res) {
										if (object.fail) {
											object.fail(res);
										}
									},
									complete: function(res) {
										if (object.complete)
											object.complete(res);
									}
								})
							} else {
								if (object.cancel) {
									app.getauth(object);
								}
							}
						}
					})
				} else {
					if (object.success) {
						object.success(res);
					}
				}
			}
		})
	}
};
args.getMchId = function(options) {
	var app = this;
	var current_mchid = '';
	if (options && options.mch_id) {
		current_mchid = options.mch_id;
	} else if (app.mch_id) {
		current_mchid = app.mch_id;
	} else if (wx.getStorageSync('_mchInfo').id) {
		current_mchid = wx.getStorageSync('_mchInfo').id;
	} else if (options && options.scene && isNaN(options.scene)) {
		//console.log(options.scene)
		var scene = decodeURIComponent(options.scene);
		if (scene) {
			scene = app.helper.scene_decode(scene);
			if (scene && scene.mch_id) {
				current_mchid = scene.mch_id
			}
		}
	}
	return current_mchid;
};

args.getStoreData = function(options) {
	var app = this;
	var api = this.api;
	var core = this.core;
	app.request({
		url: api.default.store,
		header: {
			'mch-id': app.getMchId(options)
		},
		success: function(res) {
			if (res.code == 0) {
				core.setStorageSync(app.const.STORE, res.data.store);
				core.setStorageSync(app.const.STORE_NAME, res.data.store_name);
				core.setStorageSync(app.const.SHOW_CUSTOMER_SERVICE, res.data.show_customer_service);
				core.setStorageSync(app.const.CONTACT_TEL, res.data.contact_tel);
				core.setStorageSync(app.const.SHARE_SETTING, res.data.share_setting);
				app.permission_list = res.data.permission_list;
				core.setStorageSync(app.const.WXAPP_IMG, res.data.wxapp_img);
				core.setStorageSync(app.const.WX_BAR_TITLE, res.data.wx_bar_title);
				core.setStorageSync(app.const.ALIPAY_MP_CONFIG, res.data.alipay_mp_config);
				core.setStorageSync(app.const.STORE_CONFIG, res.data);
				setTimeout(function(e) {
					app.config = res.data;
					if (app.configReadyCall) {
						app.configReadyCall(res.data);
					}
				}, 1000)
			}
		},
		complete: function() {
			//page.login();
		}
	});
}

args.checkUpdate = function() {
	if (wx.canIUse('getUpdateManager')) {
		const updateManager = wx.getUpdateManager();
		updateManager.onCheckForUpdate(function(res) {
			// console.log('onCheckForUpdate====', res)
			// 请求完新版本信息的回调
			if (res.hasUpdate) {
				// console.log('res.hasUpdate====')
				updateManager.onUpdateReady(function() {
					wx.showModal({
						title: '更新提示',
						content: '新版本已经准备好，是否立即体验？',
						success: function(res) {
							// console.log('success====', res)
							// res: {errMsg: "showModal: ok", cancel: false, confirm: true}
							if (res.confirm) {
								// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
								updateManager.applyUpdate()
							}
						}
					})
				})
				updateManager.onUpdateFailed(function() {
					// 新的版本下载失败
					wx.showModal({
						title: '已经有新版本了哟~',
						content: '新版本已经上线啦~，请您删除当前小程序，重新打开哟~'
					})
				})
			}
		});
		//} else {
		//wx.showModal({
		//    title: '提示',
		//    content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
		//})
	}
}
// 店铺id
args.mch_id = '';
//邀请人id
args.promoter_id = '';
let app = App(args);
