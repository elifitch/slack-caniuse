'use strict';
const debug = require('debug')('app:features-model');
const Promise = require('bluebird');
const dbService = require('../services/database.service.js');
const dbUtils = require('../lib/database.utils.js');
const featureUtils = require('../lib/feature.utils.js');

module.exports = (function() {
	// TODO: Probably a good idea to cache this stuff
	// TODO: return data format should always be consistent;
	// probably easiest if its always and object with keys of the features name?

	return {
		makeFeatures,
		listFeatures,
		findFeature,
		getFeatureByName,
		getFeatureById,
		getRawUpdatedFeatures
	}

	/* public api */
	function makeFeatures(data) {
		const db = dbService.getDb();
		const features = db.collection('features');

		const featureList = Object.keys(data).map(featureName => {
			return {
				name: featureName,
				data: data[featureName]
			}
		});

		return Promise.all(
			featureList.map(feature => {
				// debug(`Upserting feature to db: ${feature.name}`);
				return features.update({name: feature.name}, feature, {
					upsert: true
				})
			})
		);
	}

	function listFeatures() {
		const db = dbService.getDb();
		const features = db.collection('features');

		return new Promise((resolve, reject) => {
			features.find({}).toArray((err, docs) => {
				if (docs) {
					const decoded = docs.map(doc => dbUtils.decodeDots(doc));
					resolve(decoded);
				} else {
					reject(err)
				}
			})
		})
	}

	function findFeature(query) {
		const db = dbService.getDb();
		const features = db.collection('features');

		return new Promise((resolve, reject) => {
			// $regex: .*someString*. = contains someString
			features.find({$or:[
					{'data.title': new RegExp(`.*${query}.*`, 'gi')},
					{'name': new RegExp(`.*${query}.*`, 'gi')},
					// For now, not searching description, too loose.
					// {'data.description': new RegExp(`.*${query}.*`, 'gi')},
					{'data.keywords': new RegExp(`.*${query}.*`, 'gi')}
				]}).toArray((err, docs) => {
					if (docs) {
						const decoded = docs.map(doc => dbUtils.decodeDots(doc));
						resolve(decoded);
					} else {
						reject(err);
					}
			});
		})
	}

	function getFeatureByName(featureName) {
		const db = dbService.getDb();
		const features = db.collection('features');

		return new Promise((resolve, reject) => {
			features.findOne({
				name: featureName
			}, (err, doc) => {
				if (err) {
					reject(err);
				}
				resolve(dbUtils.decodeDots(doc));
			});
		});
	}

	function getFeatureById(featureId) {
		const db = dbService.getDb();
		const features = db.collection('features');

		return new Promise((resolve, reject) => {
			features.findOne({
				_id: dbService.ObjectId(featureId)
			}, (err, doc) => {
				if (err) {
					reject(err);
				}
				debug(doc);
				resolve(dbUtils.decodeDots(doc));
			});
		});
	}

	function getRawUpdatedFeatures(browserData) {
		// TODO: This should accept two arguments, browser data and list features
		// that way it won't have any intermediate queries. This is more efficient,
		// because you can have several queries that depend on listFeatures(),
		// but only make that query one time.  This can and should probably live in
		// feature utilities, because it wouldn't actually query the database, it just filters data
		return listFeatures().then(features => {
			const browserNames = Object.keys(browserData);
			return features.reduce((rawUpdates, feature) => {
				let returnData = {
					name: feature.name,
					data: {}
				};
				browserNames.forEach(browserName => {
					const {currentVersion, lastVersion} = browserData[browserName];
					if (currentVersion && lastVersion) {
						const currentSupport = feature.data.stats[browserName][currentVersion];
						const lastSupport = feature.data.stats[browserName][lastVersion];
						if (currentSupport !== lastSupport) {
							// Making this crazy key as a way to cheat and do shallow comparisons
							const key = featureUtils.browserSupportKey({
								browserName,
								currentVersion,
								currentSupport,
								lastVersion,
								lastSupport
							});
							returnData.data[key] = {
								browser: browserName,
								currentVersion: currentVersion,
								currentSupport: currentSupport,
								lastVersion: lastVersion,
								lastSupport: lastSupport
							};
						}
					}
				});
				if (Object.keys(returnData.data).length > 1) {
					rawUpdates[feature.name] = returnData;
				}
				return rawUpdates;
			}, {});
		});
	}

	/* private */

	function _stringify(data) {
		data.stats = JSON.stringify(data.stats);
		return data;
	}

	function _parse(data) {
		// data.stats = JSON.parse(data.stats);
		return data;
	}

})()
