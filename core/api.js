let siteinfo = require('../siteinfo.js');
let _api_root = '';
let _search_root = siteinfo.searchapiroot;
if (siteinfo.acid != -1) {
	let siteroot = siteinfo.siteroot.substr(0, siteinfo.siteroot.indexOf('app/index.php'));
	_api_root = _api_root = siteroot + 'addons/zjhj_mall/core/web/index.php?_acid=' + siteinfo.acid + '&r=api/';
} else {
	_api_root = siteinfo.apiroot;
}
let api = {
	index: _api_root + 'default/index',
	default: {
		store: _api_root + 'default/store',
		merchants: _api_root + "default/merchants",
		index: _api_root + 'default/index',
		miaosha_list: _api_root + 'v1_1/activity/flash-sales', // v1.1 秒杀列表
		pintuan_list: _api_root + 'v1_1/activity/group-buys', // v1.1 拼团列表
		activity_list: _api_root + 'v1_1/activity/index-list', // v1.1 活动列表
		mch_goods: _api_root + 'v1_1/goods/mch-goods', // v1.1  店主推荐
		index_other: _api_root + 'v1_1/default/index', // v1.1 首页banner+滚动消息+登录用户数
		goods_special: _api_root + 'v1_1/goods/group', // v1.1 商品专题
		goods_list: _api_root + 'default/goods-list',
		cat_list: _api_root + 'default/cat-list',
		// goods: _api_root + 'default/goods',
		goods: _api_root + 'v1_6/goods/info', // v1.1 商品详情
		goods_attr: _api_root + 'v1_1/goods/attr', // v1.1 商品属性
		goods_link: _api_root + 'v1_1/goods/link-goods', // v1.1 商品推荐
		district: _api_root + 'default/district',
		son_district: _api_root + 'default/son-district', // 获取第四级地址
		goods_attr_info: _api_root + "default/goods-attr-info",
		upload_image: _api_root + "default/upload-image",
		comment_list: _api_root + "default/comment-list",
		article_list: _api_root + "default/article-list",
		article_detail: _api_root + "default/article-detail",
		video_list: _api_root + "default/video-list",
		goods_qrcode: _api_root + "default/goods-qrcode",
		coupon_list: _api_root + "default/coupon-list",
		topic_list: _api_root + "default/topic-list",
		topic: _api_root + "default/topic",
		navbar: _api_root + "default/navbar",
		navigation_bar_color: _api_root + "default/navigation-bar-color",
		shop_list: _api_root + "default/shop-list",
		shop_detail: _api_root + "default/shop-detail",
		topic_type: _api_root + "default/topic-type",
		buy_data: _api_root + "default/buy-data",
		goods_recommend: _api_root + "default/goods-recommend",
		search: _api_root + "default/search",
		cats: _api_root + "default/cats",
		topic_qrcode: _api_root + "default/topic-qrcode",
		form_id: _api_root + "default/form-id",
		// new Ajax
		sendCode: _api_root + "mch/index/send",
		openShop: _api_root + "mch/v1_1/index/apply-submit",
		hasShop: _api_root + "user/store",
		couponsList: _api_root + "user/new-member-coupon",
		newcouponsList: _api_root + "info/couponlist",
		receiveCps: _api_root + "coupon/receive",
		// gyg_list:_api_root + "default/guangguang",
		hot_goods: _api_root + "default/brand-top",
		nav_category: _api_root + "default/sub-cat-list",
		day_sign: _api_root + "info/sign",
		sign_list: _api_root + "info/signlist",
		youhui_list: _api_root + "default/youhui-goods-list",
		active_list: _api_root + "v1_6/walk/activity-detail", // v1.1 活动详情
		// brand_list: _api_root + "default/brand-good-list",
		walk_active_list: _api_root + 'v1_6/walk/activity', // v1.6 活动详情
		walk_active_list_e: _api_root + 'v1_6/walk/e-activity', // v1.6 活动详情
		walk_goods_list: _api_root + 'v1_6/walk/goods', // 逛一逛商品列表
		walk_goods_list_JD: _api_root + 'v1_6/walk/jd-goods', // jd商品列表
		walk_goods_rec: _api_root + 'v1_6/walk/goods-rec', // 商品推荐
		walk_cats: _api_root + 'v1_6/walk/cats', // 逛一逛分类
		common_walk_cats: _api_root + 'v1_6/walk/cat-walks', // 逛一逛分类
		walk_son_cats: _api_root + 'v1_6/walk/son-cats', // 逛一逛子分类
		walk_goods_sort: _api_root + 'v1_6/walk/good-sort', // 逛一逛商品排序
		brand_list: _api_root + 'v1_6/walk/brand-detail',
		hot_search: _api_root + "info/search-hot",
		hot_search_nav: _api_root + 'v1_6/walk/search-hot', // 内购+热搜列表 
		good_search: _api_root + "info/search",
		like_search: _api_root + "info/search-like",
		caicai: _api_root + "v1_6/goods/public-like",
		signprice_list: _api_root + "info/signset",
		record_share: _api_root + "user/add-share-times",
		jindian: _api_root + 'default/jindian',
		brandDetail: _api_root + 'default/brand', // 品牌详情 网络接口
		// gyg:_api_root + "default/gg-page",   // 逛一逛 网络接口
		gyg: _api_root + "v1_1/activity/gg-index", // v1.1 逛一逛 网络接口
		gyg_list: _api_root + "default/guang-list", // 逛一逛 分类
		cartCount: _api_root + "default/cart-count", // 购物车数量 网络接口
		// activity_filter: _api_root + "default/activity-filter"  ,// 逛一逛分类 网络接口
		activity_filter: _api_root + "v1_1/activity/gg-list", // v1.1 逛一逛分类 网络接口
		goods_filter: _api_root + "default/goods-filter", // 商品分类 网络接口
		activity_qrcode: _api_root + "default/activity-qrcode", // 生成活动二维码
		walk_activity_detail: _api_root + 'v1_6/walk/activity-detail', // 爆品返场生成活动海报 qrcode_type 传15
		questionnaire: _api_root + "questionnaire/index", // 调研数据
		questionnaire_save: _api_root + "questionnaire/index/save", // 提交调研数据
		get_share_pic: _api_root + "v1_1/goods/get-share-pic", // 获取分享图片
		search_goods: _api_root + 'info/search-goods', // v1.1 搜索-商品
		search_act: _api_root + 'info/search-act', // v1.1 搜索-活动
		banner_list: _api_root + 'v1_1/banner/list&position=5', // v1.banner列表 （每日推荐入口）
		check_first_order: _api_root + 'v1_6/member/check-first-order', // 首页和商品详情页面判断是否显示 享受首单会员提示
		check_share: _api_root + 'v1_6/member/check-share', // 检查是否可以分享亲卡，或者商品详情页要不要提示领亲卡，享会员价
		share_vip: _api_root + 'v1_6/member/share', // 用户发起分享时就请求一下这个接口，不用管返回值 
		share_data: _api_root + 'v1_6/member/share-data', // 获取分享信息
		receive_share_vip: _api_root + 'v1_6/member/receive-share', // 领取分享
		vip_card_status: _api_root + 'v1_6/member/my-status', // 我的 显示亲卡的判断
		vip_share_img: _api_root + 'v1_6/member/share-img', // 获取分享时的图片
		vip_goods_list: _api_root + 'v1_6/member/member-goods', // 获取分享页面底部 会员专享商品列表 6个
		vip_get_share_info: _api_root + 'v1_6/member/share-info', // 查看分享者信息（点击领取时展示的信息）
		vip_buy_order: _api_root + 'v1_6/member/buy-prepare', // 生成购买会员订单
		vip_pay_data: _api_root + 'v1_6/member/buy-pay-data', // 支付
		vip_share_list: _api_root + 'v1_6/member/share-list', // 查看分享列表
		goods_same_tuijian: _api_root + 'v1_6/goods/cat-goods', // 商品详情 同类推荐
		all_look: _api_root + 'v1_6/goods/dj-see', // 商品详情 大家都在看
		allowance: _api_root + 'v1_6/user-subsidy/list', // 津贴列表（每页12条）
		ms_record: _api_root + 'v1_6/goods/get-ms-record', // 秒杀 谁抢到了什么
		jd_send_address: _api_root + 'v1_6/goods/jd-get-promise-tips', // 获取京东配送的预计时间
		get_superior_info: _api_root + 'v1_6/member/get-buy-tips', // 购买会员支付成功之后显示的名字和微信号
		get_share_info: _api_root + 'default/get-share-data', // 获取分享信息
		get_shangchuan: _api_root + 'v1_6/member/check-tips', //是否上传微信
		get_act_collect_pic: _api_root + 'default/mch-violent-qrcode',  // 获取活动合集海报图
		get_received_status: _api_root + 'v1_6/member/my-status', //获取是否领取过亲卡
		get_Tel: _api_root + 'default/mch-bind-tel',  // 绑定手机号
		get_brand_list: _api_root + 'v1_10/user-brand/brand-list',  // v1.10 获取品牌列表
		add_brand: _api_root + 'v1_10/user-brand/add',   // v1.10 添加品牌
		get_brand_show: _api_root + 'v1_10/user-brand/list',  // v1.10 获取关注的品牌列表
		del_brand: _api_root + 'v1_10/user-brand/delete',  // v1.10 删除关注的品牌
		updata_brand: _api_root + 'v1_10/user-brand/update',  // v1.10 更新品牌提醒状态
		close_activity: _api_root + 'v1_10/user-brand/close-activity',  //  v1.10 删除关注品牌活动 
		get_sub_info: _api_root + 'user/get-sub-info',  // 津贴详情
		member_share_qrcode: _api_root + 'v1_6/member/share-qrcode',  // 生成会员海报
		my_superior: _api_root + 'user/get-parent-mch',  // v1.11 我的上级
		get_collage_goods: _api_root + 'user/get-collage-goods',  //  v1.12 凑单免运费
		open_brand_activity: _api_root + 'v1_10/user-brand/open-activity',  // 恢复活动提示
		buy_cats_list: _api_root + 'v1_12/infocircle/type-list',  //  获取每日推荐分类
		buy_acts_list: _api_root + 'v1_12/infocircle/info-list',  //  获取每日推荐活动列表
		get_material: _api_root + 'v1_12/infocircle/get-sc',   //  获取每日推荐素材
		recond_goods_want: _api_root + 'v1_6/walk/goods-want',  //  添加爆款
		walk_old_cats: _api_root + 'v1_6/walk/old-cats',  // 老分类
	},
	LockPowder: {
		vip_list: _api_root + 'v1_6/member/invite-list',
		exclusive_shop: _api_root + 'v1_6/member/get-buy-tips',
		check_tips: _api_root + 'v1_6/member/check-tips',
	},
	// 直播相关接口
	liveApi: {
		liveList: _api_root + 'v1_9/live-player/wx-live-player', // 获取直播列表
	},
	// 店主自营
	selfSupport: {
		open_private: _api_root + 'mch/mch-my-shop/apply-open', // 申请开通店主私藏
		get_goods_list: _api_root + 'mch/mch-my-goods/get-goods-list', //店主端获取商品列表
		edit_goods: _api_root + 'mch/mch-my-goods/edit-goods', // 修改或者新建商品
		get_tag: _api_root + 'mch/mch-my-goods/get-tag', // 获取所有的系统标签
		edit_cat: _api_root + 'mch/mch-my-goods/edit-cat', // 添加或修改商品分类
		get_cat_list: _api_root + 'mch-my-shop/get-cat-list-all', // 获取商品分类列表--不分页格式
		edit_shop: _api_root + 'mch/mch-my-shop/edit-my-shop', // 编辑店主公告
		express_set: _api_root + 'mch/mch-my-shop/express-set', // 自营设置--配送设置
		edit_goods_status: _api_root + 'mch/mch-my-goods/edit-goods-status', // 修改商品上下架状态
		del_goods: _api_root + 'mch/mch-my-goods/del-goods', // 删除商品
		get_goods_data: _api_root + 'mch-my-shop/get-goods-data', // 查看商品明细数据
		set_cat_top: _api_root + 'mch/mch-my-goods/set-cat-top', // 商品分类置顶
		set_goods_top: _api_root + 'mch/mch-my-goods/set-goods-top', // 置顶商品
		edit_address: _api_root + 'mch/mch-my-shop/edit-address', // 添加或修改自提地址
		get_address_list: _api_root + 'mch-my-shop/get-address-list', // 获取所有的自提提货地址列表
		get_address_data: _api_root + 'mch-my-shop/get-address-data', // 获取提货地址详细
		del_address: _api_root + 'mch/mch-my-shop/del-address', // 自营设置-提货点-删除
		order_express: _api_root + 'mch/mch-my-shop/order-express', // 自提和配送方式的--配送发货    (未使用)
		get_my_shop: _api_root + 'mch-my-shop/get-my-shop', // 获取店主公告信息和设置的配送方式
		get_goods_index: _api_root + 'mch-my-shop/get-goods-index', // 店主首页自营商品展示--6个
		edit_address_is_sel: _api_root + 'mch/mch-my-shop/edit-address-is-sel', // 更改自提地址的选中状态
		get_goods_list_user: _api_root + 'mch-my-shop/get-goods-list', // 用户端--获取商品列表
		edit_cart: _api_root + 'mch-my-shop/edit-cart', // 添加删除购物车
		get_cart: _api_root + 'mch-my-shop/get-my-cart-list', // 获取我的购物车列表
		edit_cart_is_sel: _api_root + 'mch-my-shop/edit-cart-is-sel', // 更改购物车的选中状态
		get_default_address: _api_root + 'mch-my-shop/get-default-address', // 获取用户的默认收货地址
		add_order: _api_root + 'mch-my-shop/add-order', // 生成订单
		get_order_list_user: _api_root + 'mch-my-shop/get-order-list', // 用户端获取我的订单列表
		get_order_list: _api_root + 'mch/mch-my-goods/get-order-list', // 店主端获取我的订单列表
		cancel_order: _api_root + 'mch-my-shop/apply-cancel-order', // 发起申请取消订单
		cancel_order_shoper: _api_root + 'mch/mch-my-goods/mch-order-cancel', // 店主取消订单
		get_order_data: _api_root + 'mch-my-shop/get-order-data', // 查看订单明细
		audit_order_cancel: _api_root + 'mch/mch-my-goods/audit-order-cancel', // 店主同意用户的申请取消订单的操作或者驳回
		get_express_list: _api_root + 'mch-my-shop/get-express-list', // 获取物流公司列表
		confirm_order: _api_root + 'mch-my-shop/confirm-order', // 确认收货
		get_express_detail: _api_root + 'mch-my-shop/get-express-detail', // 查看物流配送信息
		check_apply: _api_root + 'mch-my-shop/check-apply', // 检测店主是否开通了店主私藏
		get_order_num: _api_root + 'mch/mch-my-goods/get-order-num', // 获取未完成的订单数量
		get_cart_num: _api_root + 'mch-my-shop/get-cart-num', // 获取购物车数量
		pay_data: _api_root + 'mch-my-shop/pay-data', // 订单支付
		qrcode: _api_root + 'mch-my-shop/qrcode', // 生成海报--(商品或店铺)
		get_article: _api_root + 'mch-my-shop/get-article', // 获取开通店主私藏时的协议信息
		share_goods_qrcode: _api_root + 'mch-my-shop/share-goods-qrcode', // 生成海报--商品分享卡片
		upload_rel_image: _api_root + 'mch/mch-my-goods/upload-rel-image', // 申请开通店主私藏--上传或修改资质信息
		upload_rel: _api_root + 'mch/mch-my-shop/upload-rel', // 申请开通店主私藏--上传或修改资质信息
		upload_image: _api_root + 'mch/mch-my-goods/upload-image', // 上传图片(上传商品)
		get_rel_data: _api_root + 'mch/mch-my-shop/get-rel-data', // 获取店主上传的资质信息
		del_cat: _api_root + 'mch/mch-my-goods/del-cat', // 删除商品分类
		last_zt: _api_root + 'mch-my-shop/last-zt', // 获取用户对于这家店上一次自提方式下单的联系人信息
		get_zy_article: _api_root + 'mch-my-shop/get-zy-article', // 获取店主自营的重要提示和安全支付提示文章
	},
	search: {
		goods: _search_root + 'search', // v1.3搜索-商品
		cats: _search_root + 'cats', // v1.3搜索-分类
		brands: _search_root + 'brands', // v1.3搜索-品牌
	},
	cart: {
		list: _api_root + 'cart/list',
		add_cart: _api_root + 'cart/add-cart',
		delete: _api_root + 'cart/delete',
		cart_edit: _api_root + 'cart/cart-edit',
		cart_click: _api_root + 'cart/click',  // 购物车全选

	},
	passport: {
		login: _api_root + 'passport/login',
		on_login: _api_root + 'passport/on-login',
	},
	order: {
		submit_preview: _api_root + 'order/submit-preview',
		submit: _api_root + 'order/submit',
		// pay_data: _api_root + 'order/pay-data', // v1.1 支付接口
		pay_data: _api_root + 'v1_6/order/pay-data', //  v1.6 支付接口
		list: _api_root + 'order/list', // v 1.0.0
		detail_list: _api_root + 'order/detail-list', // v 1.1 订单列表 网络接口
		revoke: _api_root + 'order/revoke',
		buy_again: _api_root + 'cart/buy-again', // 再次购买
		confirm: _api_root + 'order/confirm',
		count_data: _api_root + 'order/count-data',
		detail: _api_root + 'v1_6/order/detail',
		refund_preview: _api_root + 'order/refund-preview',
		refund: _api_root + 'order/refund',
		refund_detail: _api_root + 'order/refund-detail',
		comment_preview: _api_root + 'order/comment-preview',
		comment: _api_root + 'order/comment',
		express_detail: _api_root + 'order/express-detail',
		clerk: _api_root + "order/clerk",
		clerk_detail: _api_root + 'order/clerk-detail',
		get_qrcode: _api_root + 'order/get-qrcode',
		location: _api_root + 'order/location',
		refund_send: _api_root + 'order/refund-send',
		// new_submit_preview: _api_root + 'order/new-submit-preview',
		new_submit_preview: _api_root + 'v1_6/order/preview',
		// new_submit: _api_root + 'order/new-submit',
		new_submit: _api_root + 'v1_6/order/submit', // v1.6下单列表
		urge_send: _api_root + 'order/urge-send', // 提醒发货 网络接口
		after_sale: _api_root + 'order/after-sale', // 售后列表 网络接口
		cancel_refund: _api_root + 'order/cancel-refund', // v1.1 取消售后
		refund_step: _api_root + 'order/refund-step', // 售后详情步骤
		send_express: _api_root + 'order/writ-exp', // 填写快递信息
		send_express_e: _api_root + 'order/writ-exp-e', // 填写快递信息-e
		sure_reason_comp: _api_root + 'order/sure-reason-comp', // 确认寄货方式
		upDoor: _api_root + 'order/writ-visit-address', // 填写京东上门取件信息
		getReason: _api_root + 'order/get-reason', // 获取退款原因
		cancel_order: _api_root + 'v1_6/order/cancel-order', // 发起申请取消订单
	},
	user: {
		address_list: _api_root + 'user/address-list',
		address_detail: _api_root + 'user/address-detail',
		address_save: _api_root + 'user/address-save',
		address_set_default: _api_root + 'user/address-set-default',
		address_delete: _api_root + 'user/address-delete',
		save_form_id: _api_root + "user/save-form-id",
		favorite_add: _api_root + "user/favorite-add",
		favorite_remove: _api_root + "user/favorite-remove",
		favorite_list: _api_root + "user/favorite-list",
		index: _api_root + "user/index",
		wechat_district: _api_root + "user/wechat-district",
		add_wechat_address: _api_root + "user/add-wechat-address",
		topic_favorite: _api_root + "user/topic-favorite",
		topic_favorite_list: _api_root + "user/topic-favorite-list",
		member: _api_root + "user/member",
		card: _api_root + "user/card",
		card_qrcode: _api_root + "user/card-qrcode",
		card_clerk: _api_root + "user/card-clerk",
		web_login: _api_root + "user/web-login",
		submit_member: _api_root + "user/submit-member",
		user_binding: _api_root + 'user/user-binding',
		user_hand_binding: _api_root + 'user/user-hand-binding',
		user_empower: _api_root + 'user/user-empower',
		sms_setting: _api_root + 'user/sms-setting',
		authorization_bind: _api_root + 'user/authorization-bind',
		check_bind: _api_root + 'user/check-bind',
		card_detail: _api_root + 'user/card-detail',
		updata_mch_tips: _api_root + 'user/up-mch-tips',  // v1.10 更新50会员通知
	},
	share: {
		join: _api_root + 'share/join',
		check: _api_root + 'share/check',
		get_info: _api_root + 'share/get-info',
		get_price: _api_root + 'share/get-price',
		apply: _api_root + 'share/apply',
		cash_detail: _api_root + 'share/cash-detail',
		get_qrcode: _api_root + 'share/get-qrcode',
		shop_share: _api_root + 'share/shop-share',
		bind_parent: _api_root + 'share/bind-parent',
		get_team: _api_root + 'share/get-team',
		get_order: _api_root + 'share/get-order',
		index: _api_root + 'share/index',
	},
	miaosha: {
		list: _api_root + 'miaosha/list',
		goods_list: _api_root + 'miaosha/goods-list',
		details: _api_root + 'miaosha/details',
		submit_preview: _api_root + 'miaosha/submit-preview',
		submit: _api_root + 'miaosha/submit',
		pay_data: _api_root + 'miaosha/pay-data',
		order_list: _api_root + 'miaosha/order-list',
		order_details: _api_root + 'miaosha/order-details',
		order_revoke: _api_root + 'miaosha/revoke',
		express_detail: _api_root + 'miaosha/express-detail',
		confirm: _api_root + 'miaosha/confirm',
		comment_preview: _api_root + 'miaosha/comment-preview',
		comment: _api_root + 'miaosha/comment',
		refund_preview: _api_root + 'miaosha/refund-preview',
		refund: _api_root + 'miaosha/refund',
		refund_detail: _api_root + 'miaosha/refund-detail',
		comment_list: _api_root + "miaosha/comment-list",
		goods_qrcode: _api_root + "miaosha/goods-qrcode",
	},
	group: {
		index: _api_root + 'group/index/index',
		list: _api_root + 'group/index/good-list',
		details: _api_root + 'group/index/good-details',
		goods_attr_info: _api_root + "group/index/goods-attr-info",
		submit_preview: _api_root + 'group/order/submit-preview',
		submit: _api_root + 'group/order/submit',
		pay_data: _api_root + 'group/order/pay-data',
		order: {
			list: _api_root + 'group/order/list',
			detail: _api_root + 'group/order/detail',
			express_detail: _api_root + 'group/order/express-detail',
			comment_preview: _api_root + 'group/order/comment-preview',
			comment: _api_root + 'group/order/comment',
			confirm: _api_root + 'group/order/confirm',
			goods_qrcode: _api_root + 'group/order/goods-qrcode',
			get_qrcode: _api_root + 'group/order/get-qrcode',
			clerk: _api_root + 'group/order/clerk',
			clerk_order_details: _api_root + 'group/order/clerk-order-details',
			revoke: _api_root + 'group/order/revoke',
			refund_preview: _api_root + 'group/order/refund-preview',
			refund: _api_root + 'group/order/refund',
			refund_detail: _api_root + 'group/order/refund-detail',
		},
		group_info: _api_root + 'group/order/group',
		comment: _api_root + 'group/index/goods-comment',
		goods_qrcode: _api_root + 'group/index/goods-qrcode',
		search: _api_root + 'group/index/search',
		open_shop: _api_root + 'mch/v1_1/index/group-mch', // 社区团购店主开店申请接口
		group_list: _api_root + 'v1_5/community-group-buy/group-list', // 获取社区团购商品列表
		check_group: _api_root + 'v1_5/community-group-buy/check-group', // 检测是否有社区团购活动，和获取活动公告
		get_distance: _api_root + 'v1_5/community-group-buy/get-distance', // 创建订单前的预览订单接口修改（传参照旧）
		get_group_order_list: _api_root + 'v1_5/community-group-buy/get-order-list', // 获取订单列表
		pick_qrcode: _api_root + 'v1_5/community-group-buy/order-qrcode', // 生成自提订单二维码
		pick_order_detail: _api_root + 'v1_5/community-group-buy/get-order-data', // 自提订单详细
		pick_order_confirm: _api_root + 'v1_5/community-group-buy/order-confirm', // 确认提货
		pick_goods_tuijian: _api_root + 'v1_1/goods/sq-goods', // 获取自提商品详情页更多推荐
		index_jx_nav: _api_root + 'v1_1/activity/index-jx', // 首页精选
		get_pick_backgroud: _api_root + 'v1_5/community-group-buy/get-banner', // 获取社区团购背景图
		get_buy_record: _api_root + 'v1_5/community-group-buy/get-buy-record', // 获取展示谁购买了什么轮播数据10条
		pick_buy_qrcode: _api_root + 'v1_5/community-group-buy/mch-qrcode', // 获取分享店铺二维码（需要登入）
	},
	quick: {
		quick: _api_root + 'quick/quick/quick',
		quick_goods: _api_root + 'quick/quick/quick-goods',
		quick_car: _api_root + 'quick/quick/quick-car',
	},
	recharge: {
		index: _api_root + 'recharge/index',
		list: _api_root + 'recharge/list',
		submit: _api_root + 'recharge/submit',
		record: _api_root + 'recharge/record',
		detail: _api_root + 'recharge/detail',
	},
	mch: {
		apply: _api_root + 'mch/index/apply',
		apply_submit: _api_root + 'mch/index/apply-submit',
		shop: _api_root + 'mch/index/shop',
		shop_list: _api_root + 'mch/index/shop-list',
		shop_cat: _api_root + 'mch/index/shop-cat',
		daily_type_list: _api_root + 'mch/infocircle/type-list', // v1.1 获取每日推荐分类
		get_price_section: _api_root + 'mch/infocircle/get-price-section', // v1.1 获取每日推荐分类(新)
		daily_info_list: _api_root + 'mch/infocircle/info-list', // v1.1 获取每日推荐列表
		daily_info_share: _api_root + 'mch/infocircle/info-share', //  v1.1 提交推荐状态
		user: {
			myshop: _api_root + 'mch/user/myshop',
			get_user_privacy: _api_root + 'user/get-user-privacy', // v 1.1 获取逛店记录
			user_privacy: _api_root + 'user/user-privacy', // v 1.1 是否开启逛店记录
			apply_pre_data: _api_root + 'v1_1/open-mch/apply-pre-data', // v1.1 open3数据
			apply_pre_save: _api_root + 'v1_1/open-mch/apply-pre-save', // v1.1 open3提交数据
			shop: _api_root + 'user/shop',
			seller: _api_root + 'user/seller',
			setting: _api_root + 'mch/user/setting',
			setting_submit: _api_root + 'mch/user/setting-submit',
			shop_qrcode: _api_root + 'mch/user/shop-qrcode',
			account: _api_root + 'mch/user/account',
			cash: _api_root + 'mch/user/cash',
			account_log: _api_root + 'mch/user/account-log',
			cash_log: _api_root + 'mch/user/cash-log',
			tongji_year_list: _api_root + 'mch/user/tongji-year-list',
			tongji_month_data: _api_root + 'mch/user/tongji-month-data',
			cash_preview: _api_root + 'mch/user/cash-preview',
			settle_log: _api_root + 'mch/user/settle-log',
			shop_detail: _api_root + 'user/shop-detail',
			read_tutor_num: _api_root + 'user/read-tutor-num' //获取导师信息 网络接口
		},
		goods: {
			list: _api_root + 'mch/goods/list',
			set_status: _api_root + 'mch/goods/set-status',
			delete: _api_root + 'mch/goods/delete',
		},
		order: {
			list: _api_root + 'mch/order/list',
			detail: _api_root + 'mch/order/detail',
			send: _api_root + 'mch/order/send',
			refund: _api_root + 'mch/order/refund',
			edit_price: _api_root + 'mch/order/edit-price',
			refund_detail: _api_root + 'mch/order/refund-detail',
		},
	},
	integral: {
		index: _api_root + 'integralmall/integralmall/index',
		coupon_info: _api_root + 'integralmall/integralmall/coupon-info',
		exchange_coupon: _api_root + 'integralmall/integralmall/exchange-coupon',
		integral_pay: _api_root + 'integralmall/integralmall/integral-pay',
		goods_info: _api_root + 'integralmall/integralmall/goods-info',
		submit_preview: _api_root + 'integralmall/integralmall/submit-preview',
		submit: _api_root + 'integralmall/integralmall/submit',
		list: _api_root + 'integralmall/integralmall/list',
		revoke: _api_root + 'integralmall/integralmall/revoke',
		order_submit: _api_root + 'integralmall/integralmall/order-submit',
		confirm: _api_root + 'integralmall/integralmall/confirm',
		get_qrcode: _api_root + 'integralmall/integralmall/get-qrcode',
		clerk_order_details: _api_root + 'integralmall/integralmall/clerk-order-details',
		clerk: _api_root + 'integralmall/integralmall/clerk',
		explain: _api_root + 'integralmall/integralmall/explain',
		exchange: _api_root + 'integralmall/integralmall/exchange',
		register: _api_root + 'integralmall/integralmall/register',
		integral_detail: _api_root + 'integralmall/integralmall/integral-detail',
		goods_list: _api_root + 'integralmall/integralmall/goods-list',
	},
	pond: {
		index: _api_root + 'pond/pond/index',
		lottery: _api_root + 'pond/pond/lottery',
		prize: _api_root + 'pond/pond/prize',
		send: _api_root + 'pond/pond/send',
		setting: _api_root + 'pond/pond/setting',
		submit: _api_root + 'pond/pond/submit',
		qrcode: _api_root + 'pond/pond/qrcode',
	},
	bargain: {
		index: _api_root + 'bargain/default/index',
		goods: _api_root + 'bargain/default/goods',
		bargain_submit: _api_root + 'bargain/order/bargain-submit',
		activity: _api_root + 'bargain/order/activity',
		bargain: _api_root + 'bargain/order/bargain',
		order_list: _api_root + 'bargain/order/order-list',
		setting: _api_root + 'bargain/default/setting',
		goods_user: _api_root + 'bargain/default/goods-user',
		qrcode: _api_root + 'bargain/default/qrcode'
	},
	scratch: {
		index: _api_root + 'scratch/scratch/index',
		receive: _api_root + 'scratch/scratch/receive',
		setting: _api_root + 'scratch/scratch/setting',
		prize: _api_root + 'scratch/scratch/prize',
		submit: _api_root + 'scratch/scratch/submit',
		log: _api_root + 'scratch/scratch/log',
		qrcode: _api_root + 'scratch/scratch/qrcode',
	},
	lottery: {
		index: _api_root + 'lottery/default/index',
		prize: _api_root + 'lottery/default/prize',
		detail: _api_root + 'lottery/default/detail',
		goods: _api_root + 'lottery/default/goods',
		submit: _api_root + 'lottery/default/submit',
		qrcode: _api_root + 'lottery/default/qrcode',
		setting: _api_root + 'lottery/default/setting',
		lucky_code: _api_root + 'lottery/default/lucky-code',
		clerk: _api_root + 'lottery/default/clerk',
	},
	step: {
		index: _api_root + 'step/default/index',
		setting: _api_root + 'step/default/setting',
		qrcode: _api_root + 'step/default/qrcode',
		log: _api_root + 'step/default/log',
		convert: _api_root + 'step/default/convert',
		ranking: _api_root + 'step/default/ranking',
		goods: _api_root + 'step/default/goods',
		activity: _api_root + 'step/default/activity',
		activity_join: _api_root + 'step/default/activity-join',
		activity_detail: _api_root + 'step/default/activity-detail',
		submit: _api_root + 'step/default/submit',
		activity_log: _api_root + 'step/default/activity-log',
		activity_submit: _api_root + 'step/default/activity-submit',
		remind: _api_root + 'step/default/remind',
		pic_list: _api_root + 'step/default/pic-list',
		invite_detail: _api_root + 'step/default/invite-detail'
	},
	maijia: {
		index: _api_root + 'mch/user/myshop',
		withdrawal: _api_root + 'mch/user/income',
		getmoney: _api_root + 'mch/user/cash-previe',
		circle_type: _api_root + 'info/circletype',
		circle: _api_root + 'info/circle',
		circleshare: _api_root + 'info/circleshare',
		answer_list: _api_root + 'info/answerlist',
		answer: _api_root + 'info/answer',
		infotype: _api_root + 'info/infotype',
		list: _api_root + 'info/list',
		info_detail: _api_root + 'info/detail',
		agreelist: _api_root + 'info/agreelist',
		agree: _api_root + 'info/agree',
		unagree: _api_root + 'info/unagree',
		commentlist: _api_root + 'info/commentlist',
		comment: _api_root + 'info/comment',
		three_day: _api_root + 'user/login-in-three-days',
		fifteen_day: _api_root + 'user/login-out-fifteen-days',
		forty_day: _api_root + 'user/login-out-forty-days',
		remind_list: _api_root + 'info/tasklist',
		remind_get: _api_root + 'info/taskaccept',
		remind_my: _api_root + 'info/taskmy',
		ask_detail: _api_root + 'info/answerdetail',
		ask_agree: _api_root + 'info/answeragree',
		ask_unagree: _api_root + 'info/answerunagree',
		ask_comment: _api_root + 'info/answerreply',
		day_sign: _api_root + "info/salesign",
		sign_list: _api_root + "info/salesignlist",
		seller_list: _api_root + "mch/user/seller",
		seller_del: _api_root + "mch/user/del-seller",
		seller_add: _api_root + "user/add-seller",
		seller_sign: _api_root + "mch/user/share-sign",
		shop_qrcode: _api_root + "mch/user/shop-qrcode",
		good_manage: _api_root + "mch/goods/lists",
		good_add: _api_root + "mch/goods/add",
		good_down: _api_root + "mch/goods/del",
		cbuy_history: _api_root + "mch/user/browser-goods",
		cbuy_allorder: _api_root + "mch/user/order",
		cbuy_edit: _api_root + "mch/user/edit-labels",
		name_edit: _api_root + "mch/user/edit-shop-name",
		seller_qrcode: _api_root + 'mch/user/seller-qrcode',
		// 小亲本
		mch_note_index: _api_root + 'v1_10/mch-note/index',  // 小亲本首页
		note_mch_info: _api_root + 'v1_10/user/note-mch-info', //小亲本 小亲
		note_user_info: _api_root + 'v1_10/user/note-user-info', //小亲本 用户
		brand_user_attention: _api_root + 'v1_10/mch-note/user-attention',  // v1_10 用户品牌关注列表
		add_brand_list: _api_root + 'v1_10/mch-note/brand-list',  // v1_10 添加品牌  数据来源
		add_client_list: _api_root + 'v1_10/mch-note/user-list',  // v1_10 添加顾客  数据来源
		add_brand: _api_root + 'v1_10/mch-note/user-brand-add',  //  v1_10 添加品牌
		updata_brand: _api_root + 'v1_10/mch-note/user-brand-update',  // v1_10 更新关注状态
		del_brand: _api_root + 'v1_10/mch-note/user-brand-delete',  // v1_10 删除品牌
		user_brand_list: _api_root + 'v1_10/mch-note/user-brand-list',  // v1_10 小亲本看品牌，看用户
		user_brand_search: _api_root + 'v1_10/mch-note/search',  // v1_10 小亲本搜索
		user_brand_attention: _api_root + 'v1_10/mch-note/brand-attention',  // v1_10 用户品牌关注列表
		all_remind: _api_root + 'v1_10/mch-note/all-reminds', //小亲本 全部提醒
		activity_remind: _api_root + 'v1_10/mch-note/activity-remind', // 活动提醒
	}
};
module.exports = api;
