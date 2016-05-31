'use strict';

module.exports = (function() {
  const rp = require('request-promise');

  return {
    getFile
  }

  function getFile(url) {
    var promise = rp.get(url, function(error, response, body) {
      return body;
    });

    return promise;
  }
})()