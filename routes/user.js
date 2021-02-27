const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

// routes
router.post('/register', UserController.register);
router.get('/current', UserController.getCurrentUser);
router.post('/authenticate', UserController.authenticate);
router.post('/signin', UserController.authenticate);
router.post('/refresh-token', UserController.refreshToken);

module.exports = router;
