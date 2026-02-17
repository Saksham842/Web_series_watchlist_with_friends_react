const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/seriesController');

router.get('/home', seriesController.getHome);
router.get('/search', seriesController.searchSeries);
router.get('/:id', seriesController.getSeriesDetail);

module.exports = router;
