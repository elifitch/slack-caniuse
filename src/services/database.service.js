'use strict';

module.exports = (function() {
	const debug = require('debug')('app:database-service');
  const mongodb = require('mongodb');
  const ObjectId = require('mongodb').ObjectId;
  const Promise = require('bluebird');
  const mongoClient = mongodb.MongoClient;

  let state = {
    db: null
  }

  return {
    connect,
    getDb,
    ObjectId
  }

  //public api
  function connect(dbUrl) {
    return new Promise(function(resolve, reject) {
      mongoClient.connect(dbUrl, {
        promiseLibrary: Promise
      }).then(function(db){
        debug(`Connection established to ${process.env.DB_HOST}${process.env.DB_NAME}`);
        state.db = db;
        resolve(db);
      }).catch(function(err) {
        // console.error('Unable to connect to the mongoDB server. Error:', err);
        debug('Unable to connect to the mongoDB server. Error:', err);
        reject(error);
      });
    })
  }

  function getDb() {
    return state.db;
  }

})()
