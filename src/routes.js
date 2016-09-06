'use strict';

(function() {
    const express = require('express');
    const router = express.Router();
    const features = require('./models/features.model.js');
    const users = require('./models/users.model.js');
    const rp = require('request-promise');

    const env = require('dotenv').config();
    const slackScope = require('./config.js').slackScope;
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = process.env.SLACK_REDIRECT_URI;

    router.get('/', (req, res) => {
      res.render(__dirname + '/views/index.html', {
        clientId: clientId,
        slackScope: slackScope,
        redirectUri: redirectUri
      });
    });

    router.get('/authorize', (req, res) => {
      if (req.query.code) {
        console.log('response back with temporary code');
        //initial response with temporary access code
        const temporaryAuthCode = req.query.code;
        console.log(temporaryAuthCode);

        rp.post({
          url: 'https://slack.com/api/oauth.access',
          qs: {
            client_id: clientId,
            client_secret: clientSecret,
            code: temporaryAuthCode,
            redirect_uri: redirectUri
          }
        }).then(body => {
          const data = JSON.parse(body);
          if (data.ok) {
            console.log(data);
            users.createUser(data).then(() => {
              console.log('successfully saved user');
              res.render(__dirname + '/views/success.html', {});
            }).catch(err => {
              renderErrorPage(err);
            })
          }
        }).catch(err => {
          renderErrorPage(err);
        })
      }

    });

    router.get('/features/', (req, res) => {
      features.listFeatures().then(feats => {
        res.send(feats);
      });
    });

    router.get('/features/search/:query', (req, res) => {
      // res.sendFile(__dirname + '/views/index.html');
      const query = decodeURI(req.params.query);

      features.findFeature(query).then(feature => {
        res.send(feature);
      }).catch(err => {
        res.send(err);
      });
    });

    router.post('/test', (req, res) => {
      // console.log(JSON.parse(req.body));
      console.log(req.body);
    })

    function renderErrorPage(error) {
      console.error(err);
      res.render(__dirname + '/views/error.html', {
        error
      });
    }

    module.exports = router;
})()