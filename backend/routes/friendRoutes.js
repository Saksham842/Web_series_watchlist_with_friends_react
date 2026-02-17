const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');

router.get('/list', friendController.getFriendsList);
router.get('/users', friendController.getAvailableUsers);
router.post('/request', friendController.sendRequest);
router.post('/accept', friendController.acceptRequest);
router.get('/watchlist/:friendId', friendController.getFriendWatchlist);

module.exports = router;
