'use strict';

module.exports = (function() {
	const debug = require('debug')('app:watcher');
  const Watchify = require('github-watchify');
  const features = require('../models/features.model.js');
  const env = require('dotenv').config();
  const caniuseUrl = require('../config.js').caniuseUrl;
  const getFile = require('../lib/request.utils.js').getFile;

  return {
    watchCaniuse
  }

  function watchCaniuse(token) {
    const watcher = new Watchify({
      token: token,
      userAgent: 'caniuse-updates'
    });

    watcher.watch({
      targetUser: 'fyrd',
      targetRepo: 'caniuse',
      // targetUser: 'elifitch'
      // targetRepo: 'test-repo',
      interval: 86400000, //24 hours
      // interval: 10000, //10 sec
      onPing: function() {
        debug('github watchify ping');
      },
      onCommit: _handleCommit
    });
  }

  function _handleCommit(commit, changedFiles) {
    debug(changedFiles);
    if (changedFiles) {
      changedFiles.forEach(function(file, index, arr){
        if (file.filename.indexOf('data.json') === 0) {

          debug('caniuse data.json changed');
          getFile(caniuseUrl).then((file) => {
            features.makeFeatures(file);
          }).catch(function(err) {
            debug(err);
            reject(err);
          });

        }
      });
    }
  }
})()
