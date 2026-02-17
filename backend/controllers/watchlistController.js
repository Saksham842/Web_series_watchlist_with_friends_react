const connection = require("../config/db");
const wrapAsync = require("../utils/wrapAsync");

exports.addToWatchlist = wrapAsync(async (req, res) => {
    if (!req.session.user)
        return res.status(401).json({ success: false, message: "⚠️ Please log in first." });

    const { series_id } = req.body;
    const user_id = req.session.user.id;

    const q = `
    INSERT INTO watchlist (user_id, series_id)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE added_at = NOW();
  `;

    await connection.promise().query(q, [user_id, series_id]);
    res.json({ success: true, message: "✅ Added to Watchlist!" });
});

exports.getWatchlist = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.session.user.id;

    const query = `
    SELECT 
      s.series_id, s.title, s.poster_url, s.summary, 
      s.series_rating, s.platform,
      GROUP_CONCAT(g.genre_name SEPARATOR ', ') AS genre_name
    FROM watchlist w
    JOIN series s ON w.series_id = s.series_id
    LEFT JOIN series_genres sg ON s.series_id = sg.series_id
    LEFT JOIN genres g ON sg.genre_id = g.genre_id
    WHERE w.user_id = ?
    GROUP BY s.series_id
    ORDER BY w.added_at DESC;
  `;

    const [results] = await connection.promise().query(query, [userId]);
    res.json(results);
});

exports.removeFromWatchlist = wrapAsync(async (req, res) => {
    if (!req.session.user)
        return res.status(401).json({ message: "Unauthorized" });

    const { seriesId } = req.params;
    const userId = req.session.user.id;

    const q = `DELETE FROM watchlist WHERE user_id = ? AND series_id = ?`;

    const [result] = await connection.promise().query(q, [userId, seriesId]);

    if (result.affectedRows === 0)
        return res.status(404).json({ message: "Series not found in watchlist" });

    res.json({ message: "✅ Series removed from your watchlist!" });
});
