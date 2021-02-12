const express = require('express');
const router = express.Router();
const audioMulter = require('../config/multi-config');
const AudioController = require('../controllers/audio');

router.post('/create', audioMulter, AudioController.createAudio);

module.exports = router;
