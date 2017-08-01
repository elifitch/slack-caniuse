'use strict';
// TODO:
// If this is a util, it should not have exterior dependencies
// Coudld be a subservice from slack service
// Get it working first though.

const browsers = require('../models/browsers.model');

module.exports = (function() {

	return {
		singleFeature,
		mutliFeature
	}

	//public api
	function singleFeature(feature) {
		browsers.getBrowsers().then(browsers => {
			console.log('got browsers');
		})
		// _formatBrowserSupport(feature.data.stats.chrome);
		const data = feature.data;
		const response = {
			attachments: [
				{
					// fallback: 'Required plain-text summary of the attachment.',
					fallback: 'Required plain-text summary of the attachment.',
					// color: '#36a64f',
					color: 'red',
					// pretext: 'Optional text that appears above the attachment block',
					pretext: 'Not really.',
					// author_name: 'Bobby Tables',
					// author_link: 'http://flickr.com/bobby/',
					// author_icon: 'http://flickr.com/icons/bobby.jpg',
					// title: 'Slack API Documentation',
					title: data.title,
					// title_link: 'https://api.slack.com/',
					title_link: `https://caniuse.com/#search=${feature.name}`,
					// text: 'Optional text that appears within the attachment',
					text: data.description,
					fields: [
						{
							title: 'Chrome',
							value: 'High',
							short: true
						},
						{
							title: 'Firefox',
							value: 'High',
							short: true
						},
						{
							title: 'IE',
							value: 'High',
							short: true
						},
						{
							title: 'Edge',
							value: 'High',
							short: true
						},
						{
							title: 'Safari',
							value: 'High',
							short: true
						},
						{
							title: 'IOS Safari',
							value: 'High',
							short: true
						},
						{
							title: 'Android Browser',
							value: 'High',
							short: true
						},
						{
							title: 'Android Chrome',
							value: 'High',
							short: true
						},
						{
							title: 'Opera',
							value: 'High',
							short: true
						},
						{
							title: 'Opera Mini',
							value: 'High',
							short: true
						}
					],
					image_url: 'http://my-website.com/path/to/image.jpg',
					thumb_url: 'http://example.com/path/to/thumb.png',
					footer: 'Slack API',
					footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
					ts: 123456789
				}
			]
		}
	}

	function mutliFeature(features) {
		return {
			text: 'Your search returned a few results. Which one did you mean?',
			attachments: features.map(feature => {
				return {
					text: feature.data.title,
					fallback: 'uhhh no idea what this is',
					callback_id: 'foo_bar',
					color: '#3AA3E3',
					attachment_type: 'default',
					actions: [{
						name: feature.name,
						text: 'This one!',
						type: 'button',
						value: feature._id
					}]
				}
			})
		}
	}

	function _formatBrowserSupport(supportData) {
		//Notes:
		// * create a link: <http://eli.wtf|eli site>
		////////////////////////
		// Possible states:
		// Not supported
		// Partial (almost) support
		// polyfill
		// prefixed
		// disabled
		//////////////////////////////
		// Process
		// * check feature's current status.  Will need browser data for this. Cache. It.
		// * Check how far back that status has been the case
		// * Say "supported since v whatever"

		console.log(supportData);

	}

	function _parseBrowserSupportEntry(entry) {
		let noteIndexes = null;
		if (entry.includes('#')) {
			noteIndexes = entry.split('').reduce((notes, char, currentIndex) => {
				if(char === '#') {
					notes.push(parseInt(entry.split('')[currentIndex + 1]));
				}
				return notes
			}, []);
		}
		return {
			yes: entry.includes('y'),
			almost: entry.includes('a'),
			no: entry.includes('n'),
			polyfill: entry.includes('p'),
			unknown: entry.includes('u'),
			prefixed: entry.includes('x'),
			disabled: entry.includes('p'),
			noteIndexes
		}
	}

})()
