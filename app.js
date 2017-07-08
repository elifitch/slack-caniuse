'use strict';
(function() {
  const env = require('dotenv').config();
  const nunjucks = require('nunjucks');
  const bodyParser = require('body-parser');
  const express = require('express');
  const app = express();

  // const routes = require('./src/router.js');
  const features = require('./src/models/features.model.js');
  const dbService = require('./src/services/database.service.js');
  const watcher = require('./src/services/watcher.service.js');
  const getFile = require('./src/lib/request.utils.js').getFile;

  nunjucks.configure('src/views', {
    autoescape: true,
    express: app
  });
  
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use('/', require('./src/routes.js'));

  const caniuseUrl = require('./src/config.js').caniuseUrl;
  const dbUrl = `${process.env.DB_HOST}${process.env.DB_NAME}`;
  console.log(dbUrl);
  const githubToken = process.env.GITHUB_TOKEN;
  const port = process.env.PORT;

  // if (process.env.CLEAN) {
  //   dbService.connect(dbUrl).then(db => {
  //     db.dropCollection(features, () => {
  //       getFile(caniuseUrl).then((file) => {
  //         features.makeFeatures(file).then(() => {
  //           watcher.watchCaniuse(githubToken);
  //           app.listen(port, () => {
  //             console.log('listening on port ' + port);
  //           });
  //         });
  //       });
  //     });
  //   });
  // } else {
  //   dbService.connect(dbUrl).then(() => {
  //     getFile(caniuseUrl).then((file) => {
  //       features.makeFeatures(file).then(() => {
  //         watcher.watchCaniuse(githubToken);
  //         app.listen(port, () => {
  //           console.log('listening on port ' + port);
  //         });
  //       });
  //     });
  //   });
  // }
  if (process.env.CLEAN) {
    dbService.connect(dbUrl).then(db => {
      db.dropCollection(features, _startApp);
    });
  } else {
    dbService.connect(dbUrl).then(_startApp);
  }

  function _startApp() {
    getFile(caniuseUrl).then((file) => {
      features.makeFeatures(file).then(() => {
        watcher.watchCaniuse(githubToken);
        app.listen(port, () => {
          console.log('listening on port ' + port);
        });
      });
    });
  }

})();