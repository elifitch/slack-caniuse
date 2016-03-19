'use strict';

const Watchify = require('github-watchify');
const env = require('dotenv').config();
const rp = require('request-promise');
const mongodb = require('mongodb');

const mongoClient = mongodb.MongoClient;
const dbUrl = process.env.DB_URL;

mongoClient.connect(dbUrl, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', dbUrl);
    const features = db.collection('features');

    getFile('https://raw.githubusercontent.com/elifitch/caniuse/master/data.json').then(function(caniuse) {
      const ciu = JSON.parse(caniuse);

      const cleanData = encodeDots(ciu.data);
      console.log(cleanData);

      for (var property in cleanData) {
          if (cleanData.hasOwnProperty(property)) {
            let feature = {};
            feature.name = property;
            // feature.data = JSON.stringify(ciu.data[property]);
            feature.data = cleanData[property];
            
            // updates feature in db if already exists, if not present, adds feature
            features.update({name: property}, feature, {
              upsert: true
            });

          }
      }
    })
  }
});



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