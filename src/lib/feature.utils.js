const _ = require('lodash');

module.exports = (function() {

	return {
		filterRawUpdates,
		browserSupportKey
	}

	function filterRawUpdates(rawUpdatedFeatures, updates) {
		return new Promise((resolve, reject) => {
			Object.keys(rawUpdatedFeatures).reduce((filteredUpdates, featureName) => {
				if (!updates[featureName]) {
					// if theres no existing entries in updates for this feature
					// then it's definitely an update
					filteredUpdates.push(rawUpdatedFeatures[featureName]);
					return filteredUpdates;
				}
				// feature.data
			}, []);
			// resolve(filteredUpdates);
		});
	}

	function browserSupportKey({
		browserName,
		currentVersion,
		currentSupport,
		lastVersion,
		lastSupport
	}) {
		return `${browserName}-cv:${currentVersion}-status:${currentSupport}::lv:${lastVersion}-status:${lastSupport}`;
	}

})();
