const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');

router.get('/', watchlistController.getWatchlist);
router.post('/add', watchlistController.addToWatchlist);
router.delete('/delete/:seriesId', watchlistController.removeFromWatchlist);

module.exports = router;
