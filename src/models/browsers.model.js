'use strict';

module.exports = (function() {
	const Promise = require('bluebird');
	const dbService = require('../services/database.service.js');
	const dbUtils = require('../lib/database.utils.js');

	return {
		makeBrowsers
	}

	/* public api */
	function makeBrowsers(data) {
		return new Promise((resolve, reject) => {
			const db = dbService.getDb();
			const browsers = db.collection('browsers');

			const browserList = Object.keys(data.agents).map(browserName => {
				return {
					name: browserName,
					data: {
						versions: data.agents[browserName].versions
					}
				}
			});

			return Promise.all(
				browserList.map(browser => {
					console.log(`Upserting browser to db: ${browser.name}`);
					return browsers.update({name: browser.name}, browser, {
						upsert: true
					})
				})
			)

		})
	}

})()
