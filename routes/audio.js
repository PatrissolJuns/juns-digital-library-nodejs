const express = require('express');
const router = express.Router();
const AudioController = require('../controllers/audio');

router.post('/create', AudioController.createAudio);

module.exports = router;
