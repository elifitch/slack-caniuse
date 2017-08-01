const Promise = require('bluebird');
const request = require('request-promise');
const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
const features = require('../models/features.model.js');
const clients = require('../models/clients.model.js');

const PHRASES_TO_IGNORE = [
	'caniuse',
	'can i use',
	'can_i_use',
	'can-i-use'
];

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
		console.log(body);
		// TODO: figure out how to look up the bot user ID to make sure the
		// message is mentioning the bot. Don't want to hammer the DB with a query
		// every time a message is sent in slack. Maybe cache like 20 clients in memory?
		if (!event.type === 'message' || !_mentionsSlackbot(event.text) || !_validUser(event.user)) {
			return;
		}
		const searchTerms = _createFeatureQuery(event.text);
		Promise.all([
			features.findFeature(searchTerms),
			clients.getBotAuthByTeamId(body.team_id)
		])
		.then(([searchResults, botToken]) => {
			console.log(searchResults);
			console.log(botToken);
			postMessage({
				messageEvent: Object.assign(event, {text:JSON.stringify(searchResults)}),
				token: botToken
			});
		})
		.catch(err => {

		})
		console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
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
				text: messageEvent.text
			});
	}

	function _mentionsSlackbot(messageText) {
		return messageText.includes(process.env.TEMP_SLACK_BOT_ID);
	}

	function _validUser(userId) {
		if (userId && userId !== process.env.TEMP_SLACK_BOT_ID) {
			return true;
		}
		return false;
	}

	function _createFeatureQuery(messageText) {
		// TODO: This func is brittle? potential point of failure?
		const botId = process.env.TEMP_SLACK_BOT_ID;
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
