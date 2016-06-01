'use strict';

(function() {
    const express = require('express');
    const router = express.Router();
    const features = require('./models/features.model.js');

    router.get('/', (req, res) => {
      res.render(__dirname + '/views/index.html', {foo: 'barsss'});
    });

    router.get('/features/', (req, res) => {
      features.listFeatures().then((feats) => {
        res.send(feats);
      });
    })

    router.get('/features/search/:query', (req, res) => {
      // res.sendFile(__dirname + '/views/index.html');
      const query = decodeURI(req.params.query);

      features.findFeature(query).then((feature) => {
        console.log(feature instanceof Array);
        res.send(feature);
      }).catch((err) => {
        res.send(err);
      });
    })

    module.exports = router;
})()