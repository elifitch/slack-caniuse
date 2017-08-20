'use strict';
const debug = require('debug')('app:updates-model');
const Promise = require('bluebird');
const dbService = require('../services/database.service.js');
const dbUtils = require('../lib/database.utils.js');

module.exports = (function() {

	return {
		createUpdate,
		getUpdatesByFeatureName,
		getUpdates
	}

	function createUpdate(updateData) {
		// schema
		/*
		{
			name: featureName,
			data: {
				browserName[currentVersion]: {
					lastVersion,
					currentVersion
					changeType: supported, deprecated, partial up, partial down
				}
			}
		}
		*/

		const db = dbService.getDb();
		const updates = db.collection('updates');

		// upsert update based on feature name
		return updates.update({name: updateData.name}, updateData, {
			upsert: true
		});
	}

	function getUpdatesByFeatureName(featureName) {
		const db = dbService.getDb();
		const updates = db.collection('updates');

		return new Promise((resolve, reject) => {
			updates.find({name: featureName}).toArray((err, docs) => {
				if (err) {
					debug('Error getting update by feature name: ', err);
					reject(err);
				}
				const updateData = docs[0];
				resolve(updateData);
			});
		});
	}

	function getUpdates() {
		const db = dbService.getDb();
		const updates = db.collection('updates');

		return new Promise((resolve, reject) => {
			updates.find({}).toArray((err, docs) => {
				if (err) {
					debug('Error getting updates: ', err);
					reject(err);
				}
				resolve(dbUtils.objectify(docs, 'name'));
			})
		})
	}


})()
