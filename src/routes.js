'use strict';

(function() {
    const express = require('express');
    const router = express.Router();

    router.get('/', (req, res) => {
      console.log('asdfasdfadfs')
      res.sendFile(__dirname + '/views/index.html');
    })

    module.exports = router;
})()