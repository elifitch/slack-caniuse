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
	'ios_saf',
	'and_chr'
];
const CURRENT_SUPPORT_ONLY = [
	'chrome',
	'firefox',
	'edge',
	'safari',
	'ios_saf',
	'and_chr'
];
const GRANULAR_SUPPORT = {
	ie: [8, 9, 10, 11]
};
const BROWSER_DISPLAY_NAMES = {
	chrome: 'Chrome',
	firefox: 'Firefox',
	ie: 'IE',
	edge: 'Edge',
	safari: 'Safari',
	ios_saf: 'IOS Safari',
	and_chr: 'Android Chrome'
};

module.exports = (function() {

	return {
		singleFeature,
		mutliFeature
	}

	//public api
	function singleFeature(feature) {
		if (feature.usage_perc_y >= 90) {
			// Broad support everywhere
			return _featureSupportedMessage(feature);
		} else if (feature.usage_perc_y <= 20) {
			// not well supported yet
			return _featureNotSupportedMessage(feature);
		}
		return browsers.getBrowsers().then(browserData => {
			const response = {
				text: `Browser support information for ${feature.data.title} from caniuse.com:`,
				attachments: [
					{
						// fallback: 'Required plain-text summary of the attachment.',
						fallback: `${feature.data.title} is somewhat supported. Visit <http://caniuse.com|caniuse.com> for more details.`,
						color: '#FFCB6B',
						// pretext: 'Optional text that appears above the attachment block',
						// author_name: 'Bobby Tables',
						// author_link: 'http://flickr.com/bobby/',
						// author_icon: 'http://flickr.com/icons/bobby.jpg',
						author_name: 'Bobby Tables',
						author_link: 'http://flickr.com/bobby/',
						author_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
						title: feature.data.title,
						title_link: `https://caniuse.com/#search=${feature.name}`,
						text: feature.data.description,
						fields: _formatBrowserSupport(
							Object.assign(feature.data.stats, {usage_perc_y: feature.data.usage_perc_y}),
							browserData
						),
						image_url: 'http://my-website.com/path/to/image.jpg',
						thumb_url: 'http://example.com/path/to/thumb.png',
						footer: 'Slack-Caniuse',
						footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
						ts: 123456789
					}
				]
			}

			return response;
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
		const relevantStats = Object.keys(featureSupportData)
			.filter(browserName => RELEVANT_BROWSERS.indexOf(browserName.toLowerCase()) >= 0)
			.reduce((statsArray, browserName) => {
				if (CURRENT_SUPPORT_ONLY.indexOf(browserName) >= 0) {
					statsArray.push(_formatCurrentSupport(browserName, featureSupportData[browserName], browserData))
				} else {
					statsArray.push(_formatGranularSupport(browserName, featureSupportData[browserName], browserData))
				}
				return statsArray;
			}, []);

		debug(featureSupportData.usage_perc_y);
		relevantStats.push({
			title: 'Global support',
			value: `${featureSupportData.usage_perc_y}%`,
			short: true
		})

		return relevantStats;
	}

	function _formatCurrentSupport(browserName, supportData, browserData) {
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
			textContent = 'Not supported';
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
