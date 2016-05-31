'use strict';

module.exports = (function() {
  const Promise = require('bluebird');
  const _ = require('underscore');
  const dbService = require('../services/database.service.js');

  return {
    makeFeatures
  }

  /* public api */
  function makeFeatures(data) {
    return new Promise(function(resolve, reject) {
      //HURRAY!! We are connected. :)
      const db = dbService.getDb();
      const features = db.collection('features');
      const ciu = JSON.parse(data);
      const cleanData = _encodeDots(ciu.data);
      const length = _.size(cleanData);
      let counter = 0;

      for (var property in cleanData) {
        if (cleanData.hasOwnProperty(property)) {
          let feature = {};
          feature.name = property;
          console.log('Adding/updating feature to db: ' + feature.name);
          feature.data = cleanData[property];
          
          // updates feature in db if already exists, if not present, adds feature
          features.update({name: property}, feature, {
            upsert: true
          }).then(function() {
            counter ++;
            if (counter === length) {
              resolve();
            }
          }).catch(function(err) {
            console.log(err);
            reject(err);
          });
        }
      }
      
    })
  }


  /* private */
  function _encodeDots(obj) {
    var output = {};
    for (var i in obj) {
        if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
            output[i.replace(/\./g, 'U+FF0E')] = _encodeDots(obj[i]);
        } else {
            output[i.replace(/\./g, 'U+FF0E')] = obj[i];
        }
    }
    return output;
  }

  function _decodeDots(obj) {
    var output = {};
    for (var i in obj) {
        if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
            output[i.replace(/U\+FF0E/g, '.')] = _decodeDots(obj[i]);
        } else {
            output[i.replace(/U\+FF0E/g, '.')] = obj[i];
        }
    }
    return output;
  }

  
})()