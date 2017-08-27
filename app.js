'use strict';
(function() {
	const env = require('dotenv').config();
	const debug = require('debug')('app:app');
	const nunjucks = require('nunjucks');
	const bodyParser = require('body-parser');
	const express = require('express');
	// const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
	// const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);
	const app = express();

	const routes = require('./src/routes.js');
	const features = require('./src/models/features.model.js');
	const browsers = require('./src/models/browsers.model.js');
	const dbService = require('./src/services/database.service.js');
	const watcher = require('./src/services/watcher.service.js');
	const getFile = require('./src/lib/request.utils.js').getFile;
	const dbUtils = require('./src/lib/database.utils.js');
	const featureUtils = require('./src/lib/feature.utils.js');
	const updates = require('./src/models/updates.model');

	const caniuseUrl = require('./src/config.js').caniuseUrl;
	const dbUrl = `${process.env.DB_HOST}${process.env.DB_NAME}`;
	const githubToken = process.env.GITHUB_TOKEN;
	const port = process.env.PORT;
	const slackVerificationToken = process.env.SLACK_VERIFICATION_TOKEN;

	const slackService = require('./src/services/slack.service.js');
	const slackEvents = slackService.slackEventAdapter(slackVerificationToken);

	nunjucks.configure('src/views', {
		autoescape: true,
		express: app
	});

	app.use( bodyParser.json());
	app.use( bodyParser.urlencoded({ extended: false }));
	// Mount slack event handler on a route
	app.use('/slack/events', slackEvents.expressMiddleware());
	app.use('/', routes);

	slackService.init(slackEvents);

	if (process.env.CLEAN) {
		dbService.connect(dbUrl).then(db => {
			db.dropCollection('features', () => {
				db.dropCollection('browsers', _startApp)
			});
		});
	} else {
		dbService.connect(dbUrl).then(_startApp);
	}

	function _startApp() {
		getFile(caniuseUrl).then((file) => {
			const ciu = JSON.parse(file);
			const cleanData = dbUtils.encodeDots(ciu);
			return Promise.all([
				browsers.makeBrowsers(cleanData),
				features.makeFeatures(cleanData.data)
			]);
		})
		.then(() => {
			//////////////////////////////////
			// TODO: This should be in watcher once it's good to go
			// Just easier to test it here
			// On startup will need to make baseline updates from raw updates
			//////////////////////////////////
			let currAndLastBrowsers;
			browsers.getCurrentAndLastBrowsers()
			.then(cLBrowsers => {
				currAndLastBrowsers = cLBrowsers;
				return Promise.all([
					features.getRawUpdatedFeatures(currAndLastBrowsers),
					updates.getUpdates()
				]);
			})
			.then(([rawUpdatedFeatures, existingUpdatesData]) => {
				return featureUtils.filterRawUpdates(rawUpdatedFeatures, existingUpdatesData);
			})
			.then(freshUpdates => {

				debug(freshUpdates);
			});
			//////////////////////////////////
			watcher.watchCaniuse(githubToken);
			app.listen(port, () => {
				console.log('listening on port ' + port);

				browsers.getCurrentAndLastBrowsers()
				.then(features.getUpdatedFeatures)
				.then(updates => {
					// console.log(updates);
				});
			});
		});
	}

})();
