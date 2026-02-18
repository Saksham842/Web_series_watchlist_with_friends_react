const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/me', userController.getMe);
router.put('/profile', userController.updateProfile);
router.get('/profile/:userId', userController.getUserProfile);

module.exports = router;
