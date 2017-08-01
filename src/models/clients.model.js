'use strict';
const debug = require('debug')('app:clients-model');
const Promise = require('bluebird');
const dbService = require('../services/database.service.js');
const cache = require('memory-cache');

module.exports = (function() {
	const clientCache = new cache.Cache();

	return {
		createClient,
		getClientByTeamId,
		getBotAuthByTeamId
	}

	function createClient(clientData) {
		// TODO: enforce presence of stuff like bot, bot user id, bot token, etc
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
		clientCache.del(dataToSave.team_id);

		// upsert clients based on team id
		return clients.update({team_id: dataToSave.team_id}, dataToSave, {
			upsert: true
		});
	}

	function getClientByTeamId(teamId) {
		const db = dbService.getDb();
		const clients = db.collection('clients');

		return new Promise((resolve, reject) => {
			const cachedClient = clientCache.get(teamId);
			if (cachedClient) {
				resolve(cachedClient);
			}

			clients.find({team_id: teamId}).toArray((err, data) => {
				if (err) {
					debug('Error getting client by team id: ', err);
					reject(err);
				}
				const clientData = data[0];
				_addClientToCache(teamId, clientData);
				resolve(clientData);
			});
		});
	}

	function getBotAuthByTeamId(teamId) {
		const db = dbService.getDb();
		const clients = db.collection('clients');

		return getClientByTeamId(teamId).then(client => {
			return client.bot.bot_access_token;
		})
	}

	function _addClientToCache(teamId, clientData) {
		const oneHour = 3600000; //ms
		const oneDay = oneHour * 24;
		clientCache.put(teamId, clientData, oneDay);
	}
})()
