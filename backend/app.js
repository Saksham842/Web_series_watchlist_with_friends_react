const express = require("express");
const session = require("express-session");
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
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Session setup
app.use(
	session({
		secret: "yourSecretKeyHere",
		resave: false,
		saveUninitialized: false,
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

app.use("/api/auth", authRoutes);
app.use("/api/series", seriesRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/friends", friendRoutes);

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
