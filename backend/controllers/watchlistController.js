const connection = require("../config/db");
const wrapAsync = require("../utils/wrapAsync");

exports.addToWatchlist = wrapAsync(async (req, res) => {
    console.log("BACKEND: addToWatchlist called. Session:", !!req.session.user);
    if (!req.session.user) {
        console.warn("BACKEND: addToWatchlist - User not logged in");
        return res.status(401).json({ success: false, message: "⚠️ Please log in first." });
    }

    const { series_id } = req.body;
    const user_id = req.session.user.id;
    console.log(`BACKEND: Adding series_id ${series_id} (type: ${typeof series_id}) for user_id ${user_id}`);

    const q = `
    INSERT INTO watchlist (user_id, series_id)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE added_at = NOW();
  `;

    await connection.promise().query(q, [user_id, series_id]);
    console.log("BACKEND: Successfully added to watchlist");
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
    console.log("BACKEND: removeFromWatchlist called. Session:", !!req.session.user);
    if (!req.session.user) {
        console.warn("BACKEND: removeFromWatchlist - User not logged in");
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { seriesId } = req.params;
    const userId = req.session.user.id;
    console.log(`BACKEND: Removing series_id ${seriesId} (type: ${typeof seriesId}) for user_id ${userId}`);

    const q = `DELETE FROM watchlist WHERE user_id = ? AND series_id = ?`;

    const [result] = await connection.promise().query(q, [userId, seriesId]);

    if (result.affectedRows === 0) {
        console.warn("BACKEND: Series not found in watchlist of user");
        return res.status(404).json({ message: "Series not found in watchlist" });
    }

    console.log("BACKEND: Successfully removed from watchlist");
    res.json({ message: "✅ Series removed from your watchlist!" });
});
