'use strict';

(function() {
    const express = require('express');
    const router = express.Router();
    const features = require('./models/features.model.js');

    router.get('/', (req, res) => {
      // res.sendFile(__dirname + '/views/index.html');
      res.render(__dirname + '/views/index.html', {foo: 'barsss'});
    });

    router.get('/features/', (req, res) => {
      features.listFeatures().then((feats) => {
        // const data = JSON.parse(feats);
        // const arr = [{foo: 'bar'}, {baz: 'bop'}]
        // console.log(feats.length);
        // res.render(__dirname + '/views/index.html', {
        //   debug: feats,
        //   foo: 'features'
        // });
        res.send(feats);
      });
    })

    router.get('/features/name/:featureName', (req, res) => {
      // res.sendFile(__dirname + '/views/index.html');
      features.findByName(req.params.featureName).then((feature) => {
        res.send(feature);
      }).catch((err) => {
        res.send(err);
      });
    })

    module.exports = router;
})()