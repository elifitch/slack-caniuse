const _ = require('lodash');

module.exports = (function() {

	return {
		filterRawUpdates,
		browserSupportKey
	}

	function filterRawUpdates(rawUpdatedFeatures, updates) {
		/*
			return array of objects with schema:
			{
				name: featureName,
				data: {
					freshBrowserSupportKey: freshBrowserSupportData
				}
			}
		*/
		return new Promise((resolve, reject) => {
			const filteredUpdates = Object.keys(rawUpdatedFeatures).reduce((filteredUpdates, featureName) => {
				const rawUpdatedFeature = rawUpdatedFeatures[featureName];
				if (!updates[featureName]) {
					// if theres no existing entries in updates for this whole *feature*
					// then it's DEFinitely a new update and we can avoid some checks
					filteredUpdates.push(rawUpdatedFeature);
					return filteredUpdates;
				}

				const newUpdatesInFeature = Object.keys(rawUpdatedFeature.data).reduce((newUpdates, browserSupportKey) => {
					if (!updates[featureName].data[browserSupportKey]) {
						// If a matching key is not present, then this update has not yet been logged
						newUpdates[browserSupportKey] = rawUpdatedFeature.data[browserSupportKey];
						return newUpdates;
					}
				}, {});
				filteredUpdates.push({
					name: featureName,
					data: newUpdatesInFeature
				});
				return filteredUpdates;
			}, []);

			resolve(filteredUpdates);
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
