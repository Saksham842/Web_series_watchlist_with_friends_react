const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/seriesController');
const connection = require('../config/db');

router.get('/home', seriesController.getHome);

router.get('/genres', async (req, res) => {
    try {
        const [genres] = await connection.promise().query("SELECT * FROM genres ORDER BY genre_name");
        res.json(genres);
    } catch (error) {
        console.error("Error in inline getGenres:", error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/genre/:genreName', seriesController.getSeriesByGenre);
router.get('/search', seriesController.searchSeries);
router.get('/:id', seriesController.getSeriesDetail);

module.exports = router;
