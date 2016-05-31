'use strict';
(function() {
  const env = require('dotenv').config();

  const features = require('./src/models/features.model.js');
  const dbService = require('./src/services/database.service.js');
  const watcher = require('./src/services/watcher.service.js');
  const getFile = require('./src/lib/request.utils.js').getFile;

  const caniuseUrl = require('./src/config.js').caniuseUrl;
  const dbUrl = process.env.DB_URL;
  const githubToken = process.env.GITHUB_TOKEN;

  dbService.connect(process.env.DB_URL).then(() => {
    getFile(caniuseUrl).then((file) => {
      features.makeFeatures(file).then(() => {
        watcher.watchCaniuse(githubToken);
      })
    })
  })

})();