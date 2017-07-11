'use strict';

module.exports = (function() {
	const Promise = require('bluebird');
	const dbService = require('../services/database.service.js');
	const dbUtils = require('../lib/database.utils.js');

	return {
		makeBrowsers,
		getBrowsers,
		getCurrentAndLastBrowsers
	}

	/* public api */
	function makeBrowsers(data) {
		const db = dbService.getDb();
		const browsers = db.collection('browsers');

		const browserList = Object.keys(data.agents).map(browserName => {
			const browserData = data.agents[browserName]
			return {
				name: browserName,
				data: {
					versions: browserData.versions,
					currentVersion: browserData.versions[Object.keys(data.eras).indexOf('e0')],
					lastVersion: browserData.versions[Object.keys(data.eras).indexOf('e-1')]
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
		);
	}

	function getBrowsers() {
		/* returns array of all browser data */
		const db = dbService.getDb();
		const browsers = db.collection('browsers');

		return new Promise((resolve, reject) => {
			browsers.find({}).toArray((err, docs) => {
				if (err) {
					reject(err);
				} else {
					resolve(docs);
				}
			});
		});
	}

	function getCurrentAndLastBrowsers() {
		/* returns object of objects, keyed by browser name, omits granular version data */
		const db = dbService.getDb();
		const browsers = db.collection('browsers');

		return new Promise((resolve, reject) => {
			browsers.find({}).toArray((err, docs) => {
				if (err) {
					reject(err);
				} else {
					const results = docs.reduce((obj, doc) => {
						obj[doc.name] = {
							_id: doc._id,
							name: doc.name,
							data: {
								currentVersion: doc.currentVersion,
								lastVersion: doc.lastVersion
							}
						};
						return obj;
					}, {});
					resolve(results);
				}
			});
		});
	}

})()
