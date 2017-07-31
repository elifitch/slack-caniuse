const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
// const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);


module.exports = (function() {
	let slackEvents = null;
	return {
		init,
		slackEventAdapter
	}

	function init(slackEvents) {
		// slackEvents is the event handler exposed by
		// console.log('asdf')
		// // Mount the event handler on a route
		// // NOTE: you must mount to a path that matches the Request URL that was configured earlier
		// app.use('/slack/events', slackEvents.expressMiddleware());



		// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
		slackEvents.on('message', (event)=> {
		  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
		});

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
})()
