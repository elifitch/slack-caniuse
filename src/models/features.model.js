'use strict';
const debug = require('debug')('app:features-model');
const Promise = require('bluebird');
const dbService = require('../services/database.service.js');
const dbUtils = require('../lib/database.utils.js');

module.exports = (function() {
	// TODO: Probably a good idea to cache this stuff

	return {
		makeFeatures,
		listFeatures,
		findFeature,
		getFeatureByName,
		getFeatureById,
		getUpdatedFeatures
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

	function getUpdatedFeatures(browserData) {
		return listFeatures().then(features => {
			const browserNames = Object.keys(browserData);
			const updatedFeatures = features.reduce((updates, feature) => {
				let returnData = {
					feature: feature.name,
					data: []
				};
				browserNames.forEach(browserName => {
					const {currentVersion, lastVersion} = browserData[browserName];
					if ((currentVersion && lastVersion)) {
						const featureCurrent = feature.data.stats[browserName][currentVersion];
						const featureLast = feature.data.stats[browserName][lastVersion];
						if (featureCurrent !== featureLast) {
							returnData.data.push({
								browser: browserName,
								currentVersion: featureCurrent,
								lastVersion: featureLast
							});
						}
					}
				});
				if (returnData.data.length > 1) {
					updates.push(returnData);
				}
				return updates;
			}, []);

			return updatedFeatures;
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
