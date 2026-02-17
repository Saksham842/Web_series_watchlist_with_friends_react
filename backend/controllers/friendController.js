const connection = require("../config/db");
const wrapAsync = require("../utils/wrapAsync");

exports.getFriendsList = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const currentUserId = req.session.user.id;

    const q = `
    SELECT u.id, u.name, u.email
    FROM friendships f
    JOIN user u ON (u.id = f.sender_id OR u.id = f.receiver_id)
    WHERE (f.sender_id = ? OR f.receiver_id = ?)
      AND f.status = 'accepted'
      AND u.id != ?
  `;
    const [friends] = await connection.promise().query(q, [currentUserId, currentUserId, currentUserId]);
    res.json(friends);
});

exports.getAvailableUsers = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const currentUserId = req.session.user.id;

    // Logic to exclude already friends or pending requests could be added here
    const q = `
    SELECT id, name, email
    FROM user
    WHERE id != ?
    ORDER BY name ASC
  `;
    const [users] = await connection.promise().query(q, [currentUserId]);
    res.json(users);
});

exports.sendRequest = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const sender_id = req.session.user.id;
    const { receiver_id } = req.body;

    const q = `
    INSERT INTO friendships (sender_id, receiver_id, status)
    VALUES (?, ?, 'pending')
    ON DUPLICATE KEY UPDATE status = 'pending'
  `;
    await connection.promise().query(q, [sender_id, receiver_id]);
    res.json({ message: "✅ Friend request sent!" });
});

exports.acceptRequest = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const receiver_id = req.session.user.id;
    const { sender_id } = req.body;

    const q = `UPDATE friendships SET status = 'accepted' WHERE sender_id = ? AND receiver_id = ?`;
    await connection.promise().query(q, [sender_id, receiver_id]);
    res.json({ message: "✅ Friend request accepted!" });
});

exports.getFriendWatchlist = wrapAsync(async (req, res) => {
     if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });

    const userId = req.session.user.id;
    const friendId = req.params.friendId;

    // check friendship
    const checkQ = `
    SELECT * FROM friendships 
    WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
    AND status = 'accepted'
  `;

    const [friendsRes] = await connection.promise().query(checkQ, [userId, friendId, friendId, userId]);
   
    if (friendsRes.length === 0) {
        return res.status(403).json({ message: "You are not friends with this user." });
    }

    // fetch friend's watchlist
    const q = `
      SELECT s.series_id, s.title, s.poster_url, s.summary, 
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

    const [watchlist] = await connection.promise().query(q, [friendId]);
    res.json(watchlist);
});
