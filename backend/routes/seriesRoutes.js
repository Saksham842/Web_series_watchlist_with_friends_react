const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/seriesController');
router.get('/genres', seriesController.getGenres);

router.get('/genre/:genreName', seriesController.getSeriesByGenre);
router.get('/search', seriesController.searchSeries);
router.get('/:id', seriesController.getSeriesDetail);

module.exports = router;
