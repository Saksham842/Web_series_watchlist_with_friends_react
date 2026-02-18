const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');

router.get('/list', friendController.getFriendsList);
router.get('/users', friendController.getAvailableUsers);
router.get('/requests/pending', friendController.getPendingRequests);
router.post('/request', friendController.sendRequest);
router.post('/accept', friendController.acceptRequest);
router.post('/reject', friendController.rejectRequest);
router.post('/remove', friendController.removeFriend);
router.get('/watchlist/:friendId', friendController.getFriendWatchlist);
router.get('/common-series/:friendId', friendController.getCommonSeries);

module.exports = router;
