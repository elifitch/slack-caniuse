'use strict';

module.exports = (function() {

	return {
		singleFeature,
		mutliFeature
	}

	//public api
	function singleFeature(feature) {
		return {
			text: JSON.stringify(feature)
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
						value: feature.name
					}]
				}
			})
		}
	}

})()
