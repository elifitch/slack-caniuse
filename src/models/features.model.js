'use strict';

module.exports = (function() {
  const Promise = require('bluebird');
  const _ = require('underscore');
  const dbService = require('../services/database.service.js');

  return {
    makeFeatures,
    listFeatures,
    findFeature
  }

  /* public api */
  function makeFeatures(data) {
    return new Promise((resolve, reject) => {
      const db = dbService.getDb();
      const features = db.collection('features');
      const ciu = JSON.parse(data);
      const cleanData = _encodeDots(ciu.data);
      const length = _.size(cleanData);
      let featureList = [];

      // build iterable
      for (var property in cleanData) {
        if (cleanData.hasOwnProperty(property)) {
          const feature = {
          	name: property,
          	data: cleanData[property]
          };
          featureList.push(feature);
        }
      }

      Promise.all(
        featureList.map(feature => {
          console.log(`Upserting feature to db: ${feature.name}`);

          // updates feature in db if already exists, if not present, adds feature
          features.update({name: feature.name}, feature, {
            upsert: true
          }).then(() => {
            resolve();
          }).catch(err => {
            reject(err);
          });
        })
      ).then(() => {
        resolve();
      }).catch(err => {
        reject(err);
      })

    })
  }

  function listFeatures() {
    const db = dbService.getDb();
    const features = db.collection('features');

    return new Promise((resolve, reject) => {
      features.find({}).toArray((err, docs) => {
        if (docs) {
          resolve(_decodeDots(docs));
        } else {
          reject(err)
        }
      })
    })
  }

  function findFeature(featureName) {
    const db = dbService.getDb();
    const features = db.collection('features');

    return new Promise((resolve, reject) => {
      // $regex: .*someString*. = contains someString
      features.find({$or:[
          {'data.title': new RegExp(`.*${featureName}.*`, 'gi')},
          // For now, not searching description, too loose.
          // {'data.description': new RegExp(`.*${featureName}.*`, 'gi')},
          {'data.keywords': new RegExp(`.*${featureName}.*`, 'gi')}
        ]}).toArray((err, docs) => {
          if (docs && docs.length <= 3) {
            resolve(_decodeDots(docs));
          } else if (docs && docs.length > 3){
            reject('Oops! Your query matched too many results. Can you be more specific?');
          } else {
            reject(err);
          }
      });
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
