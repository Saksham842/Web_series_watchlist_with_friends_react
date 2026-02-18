const connection = require("../config/db");
const wrapAsync = require("../utils/wrapAsync");

exports.updateProfile = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.session.user.id;
    const { bio, profile_pic } = req.body;

    const q = "UPDATE user SET bio = ?, profile_pic = ? WHERE id = ?";
    await connection.promise().query(q, [bio, profile_pic, userId]);
    
    // Update session data if needed
    req.session.user.bio = bio;
    req.session.user.profile_pic = profile_pic;

    res.json({ success: true, message: "Profile updated successfully!" });
});

exports.getUserProfile = wrapAsync(async (req, res) => {
    const userId = req.params.userId;
    
    const q = `
        SELECT id, name, email, bio, profile_pic 
        FROM user 
        WHERE id = ?
    `;
    const [rows] = await connection.promise().query(q, [userId]);
    
    if (rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
    }

    const userProfile = rows[0];

    // Get social stats
    const [friends] = await connection.promise().query(
        "SELECT COUNT(*) as count FROM friendships WHERE (sender_id = ? OR receiver_id = ?) AND status = 'accepted'",
        [userId, userId]
    );

    const [watchlist] = await connection.promise().query(
        "SELECT COUNT(*) as count FROM watchlist WHERE user_id = ?",
        [userId]
    );

    res.json({
        ...userProfile,
        stats: {
            friends: friends[0].count,
            watchlist: watchlist[0].count
        }
    });
});

exports.getMe = wrapAsync(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.session.user.id;

    const q = "SELECT id, name, email, bio, profile_pic FROM user WHERE id = ?";
    const [rows] = await connection.promise().query(q, [userId]);
    
    res.json(rows[0]);
});
