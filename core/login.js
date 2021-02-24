module.exports = function(args) {
	var app = this;
	let currentPage = app.page.currentPage;
	let currentPageOptions = app.page.currentPageOptions;
	if (currentPage && currentPage.route === 'pages/index/index') {
		if (app.platform === 'my') {
			return;
		}
	}

	app.page.setPhone();
	app.trigger.run(app.trigger.events.login);

};
