'use strict';
const debug = require('debug')('app:browsers-model');
const Promise = require('bluebird');
const dbService = require('../services/database.service.js');
const dbUtils = require('../lib/database.utils.js');
const cache = require('memory-cache');

module.exports = (function() {
	const browserCache = new cache.Cache();

	return {
		makeBrowsers,
		getBrowsers,
		getBrowserByName,
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

		browserCache.put(
			'ALL_BROWSERS',
			_collectionByName(browserList)
		);

		return Promise.all(
			browserList.map(browser => {
				debug(`Upserting browser to db: ${browser.name}`);
				browserCache.put(browser.name, browser);
				return browsers.update({name: browser.name}, browser, {
					upsert: true
				})
			})
		);
	}

	function getBrowserByName(name) {
		return new Promise((resolve, reject) => {
			const cachedBrowser = browserCache.get(name);
			if (cachedBrowser) {
				resolve(cachedBrowser);
				return;
			}
			browsers.find({name}).toArray((err, docs) => {
				if (err) {
					reject(err);
				} else {
					resolve(docs[0]);
				}
			});
		});
	}

	function getBrowsers() {
		/* returns obj of objs keyed by browser name */
		return new Promise((resolve, reject) => {
			const cachedAllBrowsers = browserCache.get('ALL_BROWSERS');
			if (cachedAllBrowsers) {
				console.log('getting all browsers from cache');
				resolve(cachedAllBrowsers);
				return;
			}
			const db = dbService.getDb();
			const browsers = db.collection('browsers');

			browsers.find({}).toArray((err, docs) => {
				if (err) {
					reject(err);
				} else {
					console.log('getting all browsers from db');
					resolve(_collectionByName(docs));
				}
			});
		});
	}

	function getCurrentAndLastBrowsers() {
		/* returns object of objects, keyed by browser name, omits granular version data */
		// TODO: integrate caching
		const db = dbService.getDb();
		const browsers = db.collection('browsers');

		return new Promise((resolve, reject) => {
			browsers.find({}).toArray((err, docs) => {
				if (err) {
					reject(err);
				} else {
					const results = docs.reduce((returnedData, browser) => {
						returnedData[browser.name] = {
							currentVersion: browser.data.currentVersion,
							lastVersion: browser.data.lastVersion
						};
						return returnedData;
					}, {});
					resolve(results);
				}
			});
		});
	}

	function _collectionByName(browserList) {
		return browserList.reduce((obj, browser) => {
			obj[browser.name] = browser;
			return obj;
		}, {});
	}

})()
