'use strict';

module.exports = (function() {
	const debug = require('debug')('app:users-model');
	const Promise = require('bluebird');
	const dbService = require('../services/database.service.js');

	return {
		createUser,
		getUser
	}

	function createUser(userData) {
		const dataToSave = {
			access_token: userData.access_token,
			scope: userData.scope,
			user_id: userData.user_id,
			team_name: userData.team_name,
			team_id: userData.team_id,
			incoming_webhook: userData.incoming_webhook,
			bot: userData.bot
		};

		const db = dbService.getDb();
		const users = db.collection('users');

		// upsert users based on user id. Should be team???
		return users.update({user_id: dataToSave.user_id}, dataToSave, {
			upsert: true
		});
	}

	function getUser(userId) {
		const db = dbService.getDb();
		const users = db.collection('users');

		return new Promise((resolve, reject) => {
			users.find({user_id: userId}).toArray((err, data) => {
				if (err) {
					reject(err);
				}
				resolve(data);
			});
		});
	}
})()
