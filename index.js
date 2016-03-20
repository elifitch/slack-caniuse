'use strict';
(function() {
  const Watchify = require('github-watchify');
  const dbController = require('./src/database.controller');
  const env = require('dotenv').config();
  const dbUrl = process.env.DB_URL;

  const watcher = new Watchify({
    token: process.env.GITHUB_TOKEN,
    userAgent: 'caniuse-updates'
  });

  dbController.connect(dbUrl).then(dbController.getAndStoreCaniuse).then(function(caniuseJson) {
    //start github watcher
    watcher.watch({
      targetUser: 'elifitch',
      targetRepo: 'caniuse',
      interval: 86400000, //24 hours
      onPing: function() {
        console.log('github watchify ping');
      },
      onCommit: handleCommit
    }) //watcher
  });

  function handleCommit(commit, changedFiles) {
    if (changedFiles.length) {
      changedFiles.forEach(function(file, index, arr){
        if (file.filename.indexOf('/data.json') === 0) {
          console.log('caniuse data.json changed');
          dbController.connect(dbUrl).then(dbController.getAndStoreCaniuse);
        }
      });
    }
  }
})();