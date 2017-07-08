'use strict';

module.exports = (function() {
  // const Promise = require('bluebird');
  const dbService = require('../services/database.service.js');

  return {
    createUser
  }

  function createUser(userData) {
    return new Promise((resolve, reject) => {
      // const { access_token, scope, user_id, team_name, team_id } = userData;
      const dataToSave = {
        access_token: userData.access_token, 
        scope: userData.scope, 
        user_id: userData.user_id, 
        team_name: userData.team_name, 
        team_id: userData.team_id
      };

      const db = dbService.getDb();
      const users = db.collection('users');
      users.save(dataToSave).then(() => {
        resolve();
      }).catch(err => {
        reject(err);
      });
    });
  }
})()