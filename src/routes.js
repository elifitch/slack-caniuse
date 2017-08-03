'use strict';

(function() {
	const debug = require('debug')('app:routes');
	const express = require('express');
	const router = express.Router();
	const features = require('./models/features.model.js');
	const clients = require('./models/clients.model.js');
	const rp = require('request-promise');
	const safeParse = require("safe-json-parse/callback");

	const env = require('dotenv').config();
	const slackScope = require('./config.js').slackScope;
	const clientId = process.env.SLACK_CLIENT_ID;
	const clientSecret = process.env.SLACK_CLIENT_SECRET;
	const redirectUri = process.env.SLACK_REDIRECT_URI;
	const verifier = process.env.SLACK_VERIFICATION_TOKEN;

	const messageUtils = require('./lib/message.utils');

	//TODO: prune unused routes

	router.get('/', (req, res) => {
		res.render(`${__dirname}/views/index.html`, {
			clientId: clientId,
			slackScope: slackScope,
			redirectUri: redirectUri
		});
	});

	router.get('/authorize', (req, res) => {
		if (req.query.code) {
			//initial response with temporary access code
			const temporaryAuthCode = req.query.code;
			debug(`response back with temporary code: ${temporaryAuthCode}`);

			rp.post({
				url: 'https://slack.com/api/oauth.access',
				qs: {
					client_id: clientId,
					client_secret: clientSecret,
					code: temporaryAuthCode,
					redirect_uri: redirectUri
				}
			}).then(body => {
				const clientData = JSON.parse(body);
				if (clientData.ok) {
					return clients.createClient(clientData);
				} else {
					// this will be caught below
					throw('data back from slack was not ok');
				}
			}).then(() => {
				debug('successfully saved client');
				res.render(`${__dirname}/views/success.html`, {});
			}).catch(err => {
				debug('error authorizing client');
				renderErrorPage(err);
			});
		}

	});

	router.get('/features/', (req, res) => {
		features.listFeatures().then(feats => {
			res.send(feats);
		});
	});

	router.get('/features/search/:query', (req, res) => {
		const query = decodeURI(req.params.query);

		features.findFeature(query).then(feature => {
			res.send(feature);
		}).catch(err => {
			res.send(err);
		});
	});

	router.post('/caniuse', (req, res) => {
		// { token: 'hiK63eNeuWxFPgPHowiaqpS5',
		//   team_id: 'T1D4AD92P',
		//   team_domain: 'elislackdev',
		//   channel_id: 'C1D4ADC9Z',
		//   channel_name: 'general',
		//   user_id: 'U1D5EJ5AQ',
		//   user_name: 'eli',
		//   command: '/caniuse',
		//   text: 'fooooooobarrrrrr',
		//   response_url: 'https://hooks.slack.com/commands/T1D4AD92P/76496487429/f3PMknFsjReV0R4No7YKhCQW' }

		if (verifier === req.body.token) {
			features.findFeature(req.body.text).then(features => {
				if (features.length && features.length === 1) {
					// 1 feature returned
					res.send(messageUtils.mutliFeature(features));
				} else if (features.length && features.length > 1) {
					// more than 1 feature returned
					res.send(messageUtils.mutliFeature(features));
				} else {
					// No features returned
				}

			}).catch(err => {
				res.send(err);
			});
		} else {
			res.status(400).send('Request token did not match slack verification token.')
		}
	});

	router.post('/slack/interactive-message/', (req, res) => {
		let parsedPayload;
		safeParse(req.body.payload, (err, json) => {
			if (err) {
				res.status(400).send('Invalid payload')
				return;
			}
			parsedPayload = json;
		});
		if (verifier === parsedPayload.token) {
			features.getFeatureById(parsedPayload.actions[0].value).then(feature => {
				res.send(messageUtils.singleFeature(feature));
			});
		} else {
			res.status(400).send('Request token did not match slack verification token.');
			return;
		}
	});

	function renderErrorPage(error) {
		debug(error);
		res.render(`${__dirname}/views/error.html`, {
			error
		});
	}

	module.exports = router;
})()
