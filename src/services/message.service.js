'use strict';

module.exports = (function() {

	return {
		mutliFeature
	}

	//public api
	function mutliFeature(features) {
		return {
			text: JSON.stringify(features[0])
		}
	}

})()
