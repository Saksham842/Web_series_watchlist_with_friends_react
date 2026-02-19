const connection = require("../config/db");
const wrapAsync = require("../utils/wrapAsync");
const { createNotification } = require("./notificationController");

exports.getFriendsList = wrapAsync(async (req, res) => {
    console.log("DEBUG: getFriendsList called. Session:", !!req.session.user);
    if (!req.session.user) {
        console.warn("DEBUG: Unauthorized access to getFriendsList");
        return res.status(401).json({ message: "Unauthorized" });
    }
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

    // improved query to exclude existing friends and pending requests
    const q = `
    SELECT id, name, email
    FROM user
    WHERE id != ? 
      AND id NOT IN (
          SELECT sender_id FROM friendships WHERE receiver_id = ?
          UNION
          SELECT receiver_id FROM friendships WHERE sender_id = ?
      )
    ORDER BY name ASC
  `;
    const [users] = await connection.promise().query(q, [currentUserId, currentUserId, currentUserId]);
    res.json(users);
});

exports.sendRequest = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const sender_id = req.session.user.id;
    const { receiver_id } = req.body;

    // Prevent duplicate requests
    const checkQ = `SELECT * FROM friendships WHERE sender_id = ? AND receiver_id = ?`;
    const [existing] = await connection.promise().query(checkQ, [sender_id, receiver_id]);
    
    if (existing.length > 0) {
        return res.status(400).json({ message: "Request already exists." });
    }

    const q = `
    INSERT INTO friendships (sender_id, receiver_id, status)
    VALUES (?, ?, 'pending')
  `;
    await connection.promise().query(q, [sender_id, receiver_id]);
    
    // Create notification for receiver
    const [sender] = await connection.promise().query('SELECT name FROM user WHERE id = ?', [sender_id]);
    await createNotification(receiver_id, sender_id, 'request', `${sender[0].name} sent you a friend request.`);

    res.json({ success: true, message: "✅ Friend request sent!" });
});

exports.getPendingRequests = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const currentUserId = req.session.user.id;

    const q = `
    SELECT u.id, u.name, u.email, f.created_at
    FROM friendships f
    JOIN user u ON u.id = f.sender_id
    WHERE f.receiver_id = ? AND f.status = 'pending'
  `;
    const [requests] = await connection.promise().query(q, [currentUserId]);
    res.json(requests);
});

exports.acceptRequest = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const receiver_id = req.session.user.id;
    const { sender_id } = req.body;

    const q = `UPDATE friendships SET status = 'accepted' WHERE sender_id = ? AND receiver_id = ?`;
    await connection.promise().query(q, [sender_id, receiver_id]);

    // Create notification for sender (the one who initiated the request)
    const [receiver] = await connection.promise().query('SELECT name FROM user WHERE id = ?', [receiver_id]);
    await createNotification(sender_id, receiver_id, 'accept', `${receiver[0].name} accepted your friend request!`);

    res.json({ success: true, message: "✅ Friend request accepted!" });
});

exports.rejectRequest = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const receiver_id = req.session.user.id;
    const { sender_id } = req.body;

    const q = `DELETE FROM friendships WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'`;
    await connection.promise().query(q, [sender_id, receiver_id]);
    res.json({ success: true, message: "Friend request rejected." });
});

exports.removeFriend = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const currentUserId = req.session.user.id;
    const { friendId } = req.body;

    const q = `
        DELETE FROM friendships 
        WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
    `;
    await connection.promise().query(q, [currentUserId, friendId, friendId, currentUserId]);
    res.json({ success: true, message: "Friend removed." });
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

exports.getCommonSeries = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const currentUserId = req.session.user.id;
    const { friendId } = req.params;

    const q = `
        SELECT s.series_id as id, s.title, 
               GROUP_CONCAT(g.genre_name SEPARATOR ', ') AS genre
        FROM watchlist w1
        JOIN watchlist w2 ON w1.series_id = w2.series_id AND w2.user_id = ?
        JOIN series s ON w1.series_id = s.series_id
        LEFT JOIN series_genres sg ON s.series_id = sg.series_id
        LEFT JOIN genres g ON sg.genre_id = g.genre_id
        WHERE w1.user_id = ?
        GROUP BY s.series_id
        ORDER BY s.title ASC
    `;

    const [common] = await connection.promise().query(q, [currentUserId, friendId]);
    res.json(common);
});
