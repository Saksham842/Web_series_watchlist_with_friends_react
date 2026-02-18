const connection = require("../config/db");
const wrapAsync = require("../utils/wrapAsync"); 

exports.getHome = wrapAsync(async (req, res) => {
    // HERO SECTION – Top 6 rated series
    const [heroSeries] = await connection.promise().query(`
      SELECT s.series_id, s.title, s.landscape_poster_url,
             s.series_rating, s.summary AS description, s.release_year
      FROM series s
      ORDER BY s.series_rating DESC
      LIMIT 6;
    `);

    // TRENDING MOVIES – handpicked
    const [trendingMovies] = await connection.promise().query(`
      SELECT series_id, title, poster_url, series_rating, summary AS description, release_year
      FROM series
      WHERE title IN (
        'Asur','Family Man','Stranger Things','Panchayat',
        'Rocket Boys','Loki','Kota Factory','Patal Lok',
        'The Boys','Sherlock','The Last of Us','Game of Thrones'
      )
      ORDER BY FIELD(title,
        'Asur','Family Man','Stranger Things','Panchayat',
        'Rocket Boys','Loki','Kota Factory','Patal Lok',
        'The Boys','Sherlock','The Last of Us','Game of Thrones'
      );
    `);

    // Fetch selected genres for home (5/6 you requested)
    const [genres] = await connection.promise().query(`
      SELECT g.genre_id, g.genre_name
      FROM genres g
      WHERE g.genre_name IN ('action','comedy','thriller','crime','sci-fi')
      ORDER BY g.genre_name;
    `);

    // Fetch series for each selected genre (max 8 per genre)
    const genreSeriesPromises = genres.map(async (genre) => {
        const [series] = await connection.promise().query(
            `
        SELECT s.series_id, s.title, s.poster_url, s.series_rating, s.summary, s.release_year
        FROM series s
        JOIN series_genres sg ON s.series_id = sg.series_id
        WHERE sg.genre_id = ?
        ORDER BY s.series_rating DESC
        LIMIT 8;
        `,
            [genre.genre_id]
        );
        return { genre: genre.genre_name, series };
    });

    const genreSeriesRows = await Promise.all(genreSeriesPromises);

    res.json({
        heroSeries,
        trendingMovies,
        genreSeriesRows,
    });
});

exports.getSeriesDetail = wrapAsync(async (req, res) => {
    const seriesId = req.params.id;

    const seriesQuery = `
    SELECT s.series_id, s.title, s.release_year, s.summary, s.platform,
           s.poster_url, s.series_rating, s.trailer_url, g.genre_name ,s.landscape_poster_url
    FROM series s
    JOIN series_genres sg ON s.series_id = sg.series_id
    JOIN genres g ON sg.genre_id = g.genre_id
    WHERE s.series_id = ?
  `;

    const seasonsQuery = `
    SELECT se.season_id, se.number AS season_number, se.title AS season_title,
           se.overview AS season_overview, se.poster_url AS season_poster
    FROM seasons se
    WHERE se.series_id = ?
    ORDER BY se.number
  `;

    const episodesQuery = `
    SELECT e.episode_id, e.season_id, e.number AS episode_number, e.title AS episode_title,
           e.overview AS episode_overview, e.air_date
    FROM episodes e
    JOIN seasons s ON e.season_id = s.season_id
    WHERE s.series_id = ?
    ORDER BY e.season_id, e.number
  `;

    const recommendedQuery = `
    SELECT s.series_id AS id, s.title, s.poster_url, s.series_rating,
           GROUP_CONCAT(g.genre_name SEPARATOR ', ') AS genre_name
    FROM series s
    JOIN series_genres sg ON s.series_id = sg.series_id
    JOIN genres g ON sg.genre_id = g.genre_id
    WHERE s.series_id != ?
    GROUP BY s.series_id
    ORDER BY RAND() LIMIT 6;
  `;

    const [seriesResult] = await connection.promise().query(seriesQuery, [seriesId]);
    if (seriesResult.length === 0) {
        return res.status(404).json({ message: "Series not found" });
    }
    const series = seriesResult[0];

    const [seasonsResult] = await connection.promise().query(seasonsQuery, [seriesId]);
    const seasons = (seasonsResult || []).map((season) => ({
        season_id: season.season_id,
        number: season.season_number,
        title: season.season_title,
        overview: season.season_overview,
        poster_url: season.season_poster,
        episodes: [],
    }));

    const [episodesResult] = await connection.promise().query(episodesQuery, [seriesId]);
    (episodesResult || []).forEach((ep) => {
        const season = seasons.find((s) => s.season_id === ep.season_id);
        if (season) season.episodes.push(ep);
    });

    const [recommended] = await connection.promise().query(recommendedQuery, [seriesId]);

    series.seasons = seasons;
    res.json({
        series,
        recommended
    });
});

exports.searchSeries = wrapAsync(async (req, res) => {
    const query = req.query.q;
    if (!query || query.trim() === "") return res.json([]);

    const sql = `
    SELECT 
      s.series_id,
      s.title,
      s.poster_url,
      s.series_rating,
      GROUP_CONCAT(DISTINCT g.genre_name SEPARATOR ', ') AS genre_name
    FROM series s
    JOIN series_genres sg ON s.series_id = sg.series_id
    JOIN genres g ON sg.genre_id = g.genre_id
    WHERE s.title LIKE ?
    GROUP BY s.series_id, s.title, s.poster_url, s.series_rating
    ORDER BY s.series_rating DESC, s.title ASC
    LIMIT 20;
  `;

    const [results] = await connection.promise().query(sql, [`%${query}%`]);
    res.json(results);
});

exports.getGenres = wrapAsync(async (req, res) => {
    const [genres] = await connection.promise().query("SELECT * FROM genres ORDER BY genre_name");
    res.json(genres);
});

exports.getSeriesByGenre = wrapAsync(async (req, res) => {
    const genreName = req.params.genreName;
    const sql = `
        SELECT s.series_id, s.title, s.poster_url, s.series_rating, s.summary, s.release_year
        FROM series s
        JOIN series_genres sg ON s.series_id = sg.series_id
        JOIN genres g ON sg.genre_id = g.genre_id
        WHERE g.genre_name = ?
        ORDER BY s.series_rating DESC;
    `;
    const [series] = await connection.promise().query(sql, [genreName]);
    res.json(series);
});
