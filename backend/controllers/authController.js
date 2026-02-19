const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const connection = require("../config/db");
const wrapAsync = require("../utils/wrapAsync");

exports.register = wrapAsync(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const q = `
        INSERT INTO user (name, email, password, verified, otp, otp_expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            otp = VALUES(otp),
            otp_expires_at = VALUES(otp_expires_at),
            verified = 0,
            password = VALUES(password)
    `;

    connection.query(
        q,
        [name, email, hashedPassword, 0, otp, otpExpiry],
        async (err) => {
            if (err) {
                return res.status(500).json({ message: "Registration failed." });
            }

            try {
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false, // TLS
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                await transporter.sendMail({
                    from: `"BingeSync" <${process.env.EMAIL}>`,
                    to: email,
                    subject: "Your OTP for Email Verification",
                    html: `<p>Hi ${name},</p>
                           <p>Your OTP is: <b>${otp}</b></p>
                           <p>This code will expire in 10 minutes.</p>`,
                });

                res.json({ message: "OTP sent to email. Please verify." });
            } catch (mailErr) {
                res.status(200).json({ 
                    message: "Registration successful, but email sending failed. Please check your credentials.",
                });
            }
        }
    );
});

exports.verifyOtp = wrapAsync(async (req, res) => {
    const { email, otp } = req.body;

    const q = "SELECT * FROM user WHERE email = ? AND otp = ?";
    connection.query(q, [email, otp], (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (results.length === 0) return res.status(400).json({ message: "Invalid OTP" });

        const user = results[0];
        const now = new Date();

        if (new Date(user.otp_expires_at) < now) {
            return res.status(400).json({ message: "OTP expired. Please register again." });
        }

        const updateQ =
            "UPDATE user SET verified = 1, otp = NULL, otp_expires_at = NULL WHERE email = ?";
        connection.query(updateQ, [email], (err2) => {
            if (err2) return res.status(500).json({ message: "Error updating user status" });
            res.json({ message: "Verification successful! You can now log in." });
        });
    });
});

exports.login = wrapAsync(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please fill in all fields." });
    }

    const q = "SELECT * FROM user WHERE email = ?";
    connection.query(q, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Server error." });

        if (results.length === 0) {
            return res.status(401).json({ message: "No account found with this email." });
        }

        const user = results[0];

        if (!user.verified) {
            return res.status(403).json({ message: "Please verify your email before logging in." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password." });
        }

        req.session.user = { 
            id: user.id, 
            name: user.name, 
            email: user.email,
            bio: user.bio,
            profile_pic: user.profile_pic
        };
        res.json({ message: "Login successful", user: req.session.user });
    });
});

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Logout error" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logout successful" });
    });
};

exports.checkAuth = (req, res) => {
    if (req.session.user) {
        res.json({ isAuthenticated: true, user: req.session.user });
    } else {
        res.json({ isAuthenticated: false });
    }
};
