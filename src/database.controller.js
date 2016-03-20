'use strict';

module.exports = (function() {
  const rp = require('request-promise');
  const mongodb = require('mongodb');
  const Promise = require('bluebird');
  const _ = require('underscore');
  const mongoClient = mongodb.MongoClient;

  return {
    connect: connect,
    establishBaseline: establishBaseline
  }

  //public api
  function connect(dbUrl) {
    return new Promise(function(resolve, reject) {
      //this does way too much
      mongoClient.connect(dbUrl, {
        promiseLibrary: Promise
      }).then(function(db){
        console.log('Connection established to', db.options.url);
        resolve(db);
      }).catch(function(err) {
        reject(error);
        console.log('Unable to connect to the mongoDB server. Error:', err);
      });
    })
  }

  function establishBaseline(db) {
    return new Promise(function(resolve, reject) {
      //HURRAY!! We are connected. :)
      const features = db.collection('features');

      getFile('https://raw.githubusercontent.com/fyrd/caniuse/master/data.json').then(function(caniuse) {
        const ciu = JSON.parse(caniuse);

        const cleanData = encodeDots(ciu.data);
        const length = _.size(cleanData);
        let counter = 0;

        for (var property in cleanData) {
          if (cleanData.hasOwnProperty(property)) {
            let feature = {};
            feature.name = property;
            feature.data = cleanData[property];
            
            // updates feature in db if already exists, if not present, adds feature
            features.update({name: property}, feature, {
              upsert: true
            }).then(function() {
              counter ++;
              if (counter === length) {
                resolve();
                db.close();
              }
            }).catch(function(err) {
              console.log(err);
              reject(err);
            });
          }
        }
      }).catch(function(err) {
        console.log(err);
        reject(err);
      });
    })
  }



  function getFile(url) {
    var promise = rp.get(url, function(error, response, body) {
      return body;
    });

    return promise;
  }

  function encodeDots(obj) {
    var output = {};
    for (var i in obj) {
        if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
            output[i.replace(/\./g, 'U+FF0E')] = encodeDots(obj[i]);
        } else {
            output[i.replace(/\./g, 'U+FF0E')] = obj[i];
        }
    }
    return output;
  }
  function decodeDots(obj) {
    var output = {};
    for (var i in obj) {
        if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
            output[i.replace(/U\+FF0E/g, '.')] = decodeDots(obj[i]);
        } else {
            output[i.replace(/U\+FF0E/g, '.')] = obj[i];
        }
    }
    return output;
  }

  
})()