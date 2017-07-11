'use strict';
(function() {
	const env = require('dotenv').config();
	const debug = require('debug')('app:app');
  const nunjucks = require('nunjucks');
  const bodyParser = require('body-parser');
  const express = require('express');
  const app = express();

  const routes = require('./src/routes.js');
  const features = require('./src/models/features.model.js');
  const browsers = require('./src/models/browsers.model.js');
  const dbService = require('./src/services/database.service.js');
  const watcher = require('./src/services/watcher.service.js');
  const getFile = require('./src/lib/request.utils.js').getFile;
  const dbUtils = require('./src/lib/database.utils.js');

  nunjucks.configure('src/views', {
    autoescape: true,
    express: app
  });
  debug('fooooooo')
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use('/', routes);

  const caniuseUrl = require('./src/config.js').caniuseUrl;
  const dbUrl = `${process.env.DB_HOST}${process.env.DB_NAME}`;
  const githubToken = process.env.GITHUB_TOKEN;
  const port = process.env.PORT;

  if (process.env.CLEAN) {
    dbService.connect(dbUrl).then(db => {
      db.dropCollection('features', () => {
      	db.dropCollection('browsers', _startApp)
      });
    });
  } else {
    dbService.connect(dbUrl).then(_startApp);
  }

  function _startApp() {
    getFile(caniuseUrl).then((file) => {
    	const ciu = JSON.parse(file);
			const cleanData = dbUtils.encodeDots(ciu);
      return Promise.all([
      	browsers.makeBrowsers(cleanData),
      	features.makeFeatures(cleanData.data)
      ])
    }).then(() => {
      watcher.watchCaniuse(githubToken);
      app.listen(port, () => {
        console.log('listening on port ' + port);
      });
    });
  }

})();
