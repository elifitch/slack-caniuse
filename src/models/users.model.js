'use strict';

module.exports = (function() {
	const Promise = require('bluebird');
	const dbService = require('../services/database.service.js');

	return {
		createUser,
		getUser
	}

	function createUser(userData) {
		return new Promise((resolve, reject) => {
			const dataToSave = {
				access_token: userData.access_token,
				scope: userData.scope,
				user_id: userData.user_id,
				team_name: userData.team_name,
				team_id: userData.team_id
			};

			const db = dbService.getDb();
			const users = db.collection('users');
			getUser(userData.user_id).then(usersWithId => {
				if (usersWithId.length === 0) {
					users.save(dataToSave).then(() => {
						resolve(dataToSave);
					}).catch(err => {
						reject(err);
					});
				} else {
					console.log(`User already exists: ${dataToSave}`);
					resolve(dataToSave);
				}
			})
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
