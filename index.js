'use strict';
(function() {
  const Watchify = require('github-watchify');
  const dbController = require('./src/database.controller');
  const env = require('dotenv').config();
  const dbUrl = process.env.DB_URL;

  dbController.connect(dbUrl);
})();