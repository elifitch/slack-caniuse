const debug = require('debug')('app:slack-service');
const Promise = require('bluebird');
const request = require('request-promise');
const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
const features = require('../models/features.model.js');
const clients = require('../models/clients.model.js');
const messageUtils = require('../lib/message.utils');

const PHRASES_TO_IGNORE = [
	'caniuse',
	'can i use',
	'can_i_use',
	'can-i-use'
];
const BOT_NOT_MENTIONED_ERR = 'Bot not mentioned';

module.exports = (function() {
	let slackEvents = null;
	return {
		init,
		slackEventAdapter,
		postMessage
	}

	function init(slackEvents) {
		// slackEvents is the event handler exposed by this.slackEventAdapter
		// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
		slackEvents.on('message', _onMessage);

		// Handle errors (see `errorCodes` export)
		slackEvents.on('error', console.error);
	}

	function slackEventAdapter(slackVerificationToken) {
		if (slackEvents) {
			return slackEvents;
		}
		slackEvents = createSlackEventAdapter(slackVerificationToken, {
			includeBody: true
		});
		return slackEvents;
	}

	function _onMessage(event, body) {
		// console.log(body);
		let client;
		if (!event.type === 'message') {
			return;
		}
		clients.getClientByTeamId(body.team_id).then(clientData => {
			if (!_mentionsSlackbot(event.text, clientData.bot.bot_user_id)) {
				// TODO: feel like this early exit could be more elegant?
				throw(BOT_NOT_MENTIONED_ERR);
			}
			client = clientData;
			return client;
		})
		.then(client => {
			const searchTerms = _createFeatureQuery(event.text, client.bot.bot_user_id);
			return features.findFeature(searchTerms)
		})
		.then(searchResults => {
			if (searchResults.length === 1) {
				return messageUtils.singleFeature(searchResults[0])
			}
		})
		.then(responseText => {
			postMessage({
				messageEvent: Object.assign(event, {
					attachments: JSON.stringify(responseText.attachments),
					text: ''
				}),
				// messageEvent: Object.assign(event, responseText, {text: ''}),
				token: client.bot.bot_access_token
			});
			// debug(Object.assign(event, responseText, {text: ''}))
		})
		.catch(err => {
			if (err !== BOT_NOT_MENTIONED_ERR) {
				debug('error in processing slack message: ', err);
			}
		})
		// console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
	}

	function postMessage({messageEvent, token}) {
		// messageEvent schema
		// { type: 'message',
		// user: 'U1D5EJ5AQ',
		// text: '<@U6BQH5DH7> hey der',
		// ts: '1501536858.189745',
		// channel: 'C1D4ADC9Z',
		// event_ts: '1501536858.189745' }

		return request
			.post('https://slack.com/api/chat.postMessage')
			.form({
				token,
				channel: messageEvent.channel,
				text: messageEvent.text,
				attachments: messageEvent.attachments
			});
	}

	function _mentionsSlackbot(messageText, botId) {
		return messageText.includes(botId);
	}

	function _validUser(userId, botId) {
		// TODO: Better user validation, if needed at all
		// This func is junc
		if (userId && userId !== botId) {
			return true;
		}
		return false;
	}

	function _createFeatureQuery(messageText, botId) {
		// TODO: This func is brittle? potential point of failure?

		// split message on first mention of bot, take right half of that message
		messageText = messageText.split(`<@${botId}>`)[1];
		PHRASES_TO_IGNORE.forEach(phrase => {
			// trims message of all phrases we can safely ignore, like "can i use"
			// ig => case insensitive, global
			messageText = messageText.replace(new RegExp(phrase, 'ig'), '');
		});

		return messageText.trim();
	}

})()
