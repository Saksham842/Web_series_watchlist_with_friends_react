const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/', notificationController.getNotifications);
router.post('/read', notificationController.markAsRead);
router.post('/clear', notificationController.clearHistory);

module.exports = router;
