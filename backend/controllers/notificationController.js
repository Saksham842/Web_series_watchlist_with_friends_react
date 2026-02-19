const connection = require("../config/db");
const wrapAsync = require("../utils/wrapAsync");

exports.getNotifications = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.session.user.id;

    const q = `
        SELECT n.*, u.name as actor_name 
        FROM notifications n
        JOIN user u ON n.actor_id = u.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT 50
    `;
    const [notifications] = await connection.promise().query(q, [userId]);
    res.json(notifications);
});

exports.markAsRead = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.session.user.id;
    const { notificationId } = req.body;

    const q = `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`;
    await connection.promise().query(q, [notificationId, userId]);
    res.json({ success: true });
});

exports.clearHistory = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.session.user.id;

    const q = `DELETE FROM notifications WHERE user_id = ?`;
    await connection.promise().query(q, [userId]);
    res.json({ success: true, message: "Notification history cleared." });
});

// Helper for internal use (can be called from other controllers)
exports.createNotification = async (userId, actorId, type, message) => {
    const q = `INSERT INTO notifications (user_id, actor_id, type, message) VALUES (?, ?, ?, ?)`;
    await connection.promise().query(q, [userId, actorId, type, message]);
};
