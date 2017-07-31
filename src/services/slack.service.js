const Promise = require('bluebird');
const request = require('request-promise');
const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
// const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);


module.exports = (function() {
	let slackEvents = null;
	return {
		init,
		slackEventAdapter
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
		slackEvents = createSlackEventAdapter(slackVerificationToken)
		return slackEvents;
	}

	function _onMessage(event) {
		console.log(event);
		if (!_mentionsSlackbot(event.text) || !_validUser(event.user)) {
			return;
		}
		console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
		_postMessage(event);
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

	function _postMessage(messageEvent) {
		request
			.post('https://slack.com/api/chat.postMessage')
			.form({
				token: process.env.TEMP_SLACK_BOT_TOKEN,
				channel: 'C1D4ADC9Z',
				text: messageEvent.text
			})
	}

	function _validateQuery(messageText) {

	}
})()
