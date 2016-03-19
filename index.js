'use strict';

const Watchify = require('github-watchify');
const env = require('dotenv').config();
const rp = require('request-promise');
const mongodb = require('mongodb');

const mongoClient = mongodb.MongoClient;
const dbUrl = process.env.DB_URL;

// mongoClient.connect(dbUrl, function (err, db) {
//   if (err) {
//     console.log('Unable to connect to the mongoDB server. Error:', err);
//   } else {
//     //HURRAY!! We are connected. :)
//     console.log('Connection established to', dbUrl);

//     // do some work here with the database.

//     //Close connection
//     db.close();
//   }
// });
mongoClient.connect(dbUrl, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', dbUrl);

    getFile('https://raw.githubusercontent.com/elifitch/caniuse/master/data.json').then(function(caniuse) {
      // console.log(data);
      const ciu = JSON.parse(caniuse);
      const features = ciu.data;
      // console.log(features['scrollintoview']);
      for (var property in features) {
          if (features.hasOwnProperty(property)) {
            // console.log(property);
            console.log(features[property]);
          }
      }
    })


    // // Get the documents collection
    // var collection = db.collection('users');

    // //Create some users
    // var user1 = {name: 'modulus admin', age: 42, roles: ['admin', 'moderator', 'user']};
    // var user2 = {name: 'modulus user', age: 22, roles: ['user']};
    // var user3 = {name: 'modulus super admin', age: 92, roles: ['super-admin', 'admin', 'moderator', 'user']};

    // // Insert some users
    // collection.insert([user1, user2, user3], function (err, result) {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
    //   }
    //   //Close connection
    //   db.close();
    // });

    db.close();
  }
});



function getFile(url) {
  var promise = rp.get(url, function(error, response, body) {
    return body;
  });

  return promise;
}