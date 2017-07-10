'use strict';

module.exports = (function() {
	return {
		encodeDots,
		decodeDots
	}

	function encodeDots(obj) {
		var output = {};
		for (var i in obj) {
			if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
				output[i.replace(/\./g, 'U+FF0E')] = encodeDots(obj[i]);
			} else {
				output[i.replace(/\./g, 'U+FF0E')] = obj[i];
			}
		}
		return output;
	}

	function decodeDots(obj) {
		var output = {};
		for (var i in obj) {
			if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
				output[i.replace(/U\+FF0E/g, '.')] = decodeDots(obj[i]);
			} else {
				output[i.replace(/U\+FF0E/g, '.')] = obj[i];
			}
		}
		return output;
	}
})()
