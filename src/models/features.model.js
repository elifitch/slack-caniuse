'use strict';

module.exports = (function() {
	const Promise = require('bluebird');
	const dbService = require('../services/database.service.js');
	const dbUtils = require('../lib/database.utils.js');

	return {
		makeFeatures,
		listFeatures,
		findFeature,
		getFeatureByName,
		getFeatureById
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
				// console.log(`Upserting feature to db: ${feature.name}`);
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
					resolve(dbUtils.decodeDots(docs));
				} else {
					reject(err)
				}
			})
		})
	}

	function findFeature(featureName) {
		const db = dbService.getDb();
		const features = db.collection('features');

		return new Promise((resolve, reject) => {
			// $regex: .*someString*. = contains someString
			features.find({$or:[
					{'data.title': new RegExp(`.*${featureName}.*`, 'gi')},
					// For now, not searching description, too loose.
					{'data.description': new RegExp(`.*${featureName}.*`, 'gi')},
					{'data.keywords': new RegExp(`.*${featureName}.*`, 'gi')}
				]}).toArray((err, docs) => {
					if (docs && docs.length <= 3) {
						const decoded = docs.map(doc => dbUtils.decodeDots(doc));
						resolve(decoded);
					} else if (docs && docs.length > 3) {
						reject('Oops! Your query matched too many results. Can you be more specific?');
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
				resolve(dbUtils.decodeDots(doc));
			});
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
