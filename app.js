'use strict';
(function() {
  const env = require('dotenv').config();
  const express = require('express');
  const app = express();
  // const router = express.Router();

  // const routes = require('./src/router.js');
  const features = require('./src/models/features.model.js');
  const dbService = require('./src/services/database.service.js');
  const watcher = require('./src/services/watcher.service.js');
  const getFile = require('./src/lib/request.utils.js').getFile;

  // const routes = require('./src/routes.js');
  // console.log(routes());
  // console.log('asdfasdfsdaf');
  app.use('/', require('./src/routes.js'));

  const caniuseUrl = require('./src/config.js').caniuseUrl;
  const dbUrl = process.env.DB_URL;
  const githubToken = process.env.GITHUB_TOKEN;
  const port = process.env.PORT;

  dbService.connect(process.env.DB_URL).then(() => {
    getFile(caniuseUrl).then((file) => {
      features.makeFeatures(file).then(() => {
        watcher.watchCaniuse(githubToken);
        app.listen(port, () => {
          console.log('listening on port ' + port);
        })
      })
    })
  })

})();