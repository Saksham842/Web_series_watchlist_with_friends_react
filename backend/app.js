const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const ExpressError = require("./utils/expressError.js");

dotenv.config();

// Connect to Database
require("./config/db");

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173', 'http://127.0.0.1:5173', 'http://[::1]:5173',
        'http://localhost:5174', 'http://127.0.0.1:5174', 'http://[::1]:5174',
        'http://localhost:5175', 'http://127.0.0.1:5175', 'http://[::1]:5175'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Session setup
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Abcd@1234',
    database: process.env.DB_NAME || 'watchlist',
    clearExpired: true,
    checkExpirationInterval: 900000, // 15 min
    expiration: 86400000, // 1 day
    createDatabaseTable: true,
});

app.use(
    session({
        secret: "yourSecretKeyHere",
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            secure: false, // Set to true if using HTTPS
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        },
    })
);

// Routes
const authRoutes = require("./routes/authRoutes");
const seriesRoutes = require("./routes/seriesRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const friendRoutes = require("./routes/friendRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/series", seriesRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/user", userRoutes);

// Root Route
app.get("/", (req, res) => {
	res.send("API is running...");
});

// Error Handling
app.use((req, res, next) => {
	next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
	let { statusCode = 500, message = "Something went wrong" } = err;
	res.status(statusCode).json({ message });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
