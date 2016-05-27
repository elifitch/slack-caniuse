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
      targetUser: 'fyrd',
      targetRepo: 'caniuse',
      // targetUser: 'elifitch'
      // targetRepo: 'test-repo',
      // interval: 86400000, //24 hours
      interval: 6000, 
      onPing: function() {
        console.log('github watchify ping');
        handleCommit();
      },
      onCommit: handleCommit
    }) //watcher
  });

  function handleCommit(commit, changedFiles) {
    console.log(changedFiles);
    if (changedFiles) {
      changedFiles.forEach(function(file, index, arr){
        if (file.filename.indexOf('data.json') === 0) {
          console.log('caniuse data.json changed');
          dbController.connect(dbUrl).then(dbController.getAndStoreCaniuse);
        }
      });
    }
  }
})();