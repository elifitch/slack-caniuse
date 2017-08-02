'use strict';
const debug = require('debug')('app:message-utils');
// TODO:
// If this is a util, it should not have exterior dependencies
// Coudld be a subservice from slack service
// Get it working first though.

const browsers = require('../models/browsers.model');
const RELEVANT_BROWSERS = [
	'chrome',
	'firefox',
	'ie',
	'edge',
	'safari',
	'ios safari',
	'android chrome'
];
const CURRENT_SUPPORT_ONLY = [
	'chrome',
	'firefox',
	'edge',
	'safari',
	'ios safari',
	'android chrome'
];
const GRANULAR_SUPPORT = {
	ie: [8, 9, 10, 11]
};
const BROWSER_DISPLAY_NAMES = {
	'ie': 'IE',
	'firefox': 'Firefox',
	'edge': 'Edge',
	'safari': 'Safari',
	'ios safari': 'IOS Safari',
	'android chrome': 'Android Chrome'
};

module.exports = (function() {

	return {
		singleFeature,
		mutliFeature
	}

	//public api
	function singleFeature(feature) {
		// if (feature.usage_perc_y >= 90) {
		// 	// Broad support everywhere
		// 	return _featureSupportedMessage(feature);
		// } else if (feature.usage_perc_y <= 20) {
		// 	// not well supported yet
		// 	return _featureNotSupportedMessage(feature);
		// }
		browsers.getBrowsers().then(browserData => {
			console.log(_formatBrowserSupport(feature.data.stats, browserData))
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
						fields: _formatBrowserSupport(feature.data.stats, browserData),
						image_url: 'http://my-website.com/path/to/image.jpg',
						thumb_url: 'http://example.com/path/to/thumb.png',
						footer: 'Slack API',
						footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
						ts: 123456789
					}
				]
			}
		});
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

	function _formatBrowserSupport(featureSupportData, browserData) {
		// RE-FOCUS ON WHAT USERS NEED
		// Chrome: currently (un)supported, etc
		// FF: currently xxxxxx
		// Edge: currently xxxxxx
		// IE: Supported by IE x, x, x; Unsupported
		// IOS Safari: currently supported
		// Android Chrome: currently supported
		// EVERYTHING ELSE THEY CAN ASK FOR MORE INFO WITH LINKS


		const relevantStats = Object.keys(featureSupportData)
			.filter(browserName => RELEVANT_BROWSERS.indexOf(browserName.toLowerCase()) >= 0)
			.reduce((statsObj, browserName) => {
				if (CURRENT_SUPPORT_ONLY.indexOf(browserName) >= 0) {
					statsObj[browserName] = _formatCurrentSupport(browserName, featureSupportData[browserName], browserData)
				} else {
					statsObj[browserName] = _formatGranularSupport(browserName, featureSupportData[browserName], browserData)
				}
				return statsObj;
			}, {});

		return relevantStats;

	}

	function _formatCurrentSupport(browserName, supportData, browserData) {
		debug(browserName);
		const status = supportData[browserData[browserName].data.currentVersion];
		let textContent = 'Not supported';
		if (status.includes('y')) {
			textContent = 'Currently supported'
		} else if (status.includes('a')) {
			textContent = 'Partially supported'
		}

		return {
			title: BROWSER_DISPLAY_NAMES[browserName],
			value: textContent,
			short: true
		}
	}

	function _formatGranularSupport(browserName, supportData, browserData) {
		const relevantVersions = GRANULAR_SUPPORT[browserName];
		const supportValues = relevantVersions.map(versionNum => supportData[versionNum]);
		let textContent = '';
		let supportedText = '';
		let partialText = '';

		const supportedVersions = _getVersionsWithStatus(supportData, 'y').join(',').replace(/,/g, ', ');
		const partialVersions = _getVersionsWithStatus(supportData, 'a').join(',').replace(/,/g, ', ');
		if (supportedVersions) {
			supportedText = `Supported in ${BROWSER_DISPLAY_NAMES[browserName]} ${supportedVersions}`
		}
		if (partialVersions) {
			partialText = `Partially supported in ${BROWSER_DISPLAY_NAMES[browserName]} ${partialVersions}}`
		}

		if (supportedText && partialText) {
			textContent = `${supportedText}; ${partialText}`;
		} else if (supportedText && !partialText) {
			textContent = supportedText;
		} else if (partialText && !supportedText) {
			textContent = partialText;
		} else {
			textContent = `Unsupported in ${BROWSER_DISPLAY_NAMES[browserName]}`;
		}

		return {
			title: BROWSER_DISPLAY_NAMES[browserName],
			value: textContent,
			short: true
		}
	}

	function _getVersionsWithStatus(supportData, status) {
		return Object.keys(supportData).reduce((versions, version) => {
			if (supportData[version].includes(status)) {
				versions.push(version);
			}
			return versions;
		}, []);
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
