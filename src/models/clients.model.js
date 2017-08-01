'use strict';

module.exports = (function() {
	const debug = require('debug')('app:clients-model');
	const Promise = require('bluebird');
	const dbService = require('../services/database.service.js');

	return {
		createClient,
		getClientByTeamId,
		getBotAuthByTeamId
	}

	function createClient(clientData) {
		const dataToSave = {
			access_token: clientData.access_token,
			scope: clientData.scope,
			user_id: clientData.user_id,
			team_name: clientData.team_name,
			team_id: clientData.team_id,
			incoming_webhook: clientData.incoming_webhook,
			bot: clientData.bot
		};

		const db = dbService.getDb();
		const clients = db.collection('clients');

		// upsert clients based on team id
		return clients.update({team_id: dataToSave.team_id}, dataToSave, {
			upsert: true
		});
	}

	function getClientByTeamId(teamId) {
		const db = dbService.getDb();
		const clients = db.collection('clients');

		return new Promise((resolve, reject) => {
			clients.find({team_id: teamId}).toArray((err, data) => {
				if (err) {
					debug('Error getting client by team id: ', err);
					reject(err);
				}
				resolve(data);
			});
		});
	}

	function getBotAuthByTeamId(teamId) {
		const db = dbService.getDb();
		const clients = db.collection('clients');

		return getClientByTeamId(teamId).then(client => {
			return client[0].bot.bot_access_token;
		})
	}
})()
