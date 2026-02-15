import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/test-db", async (req, res) => {
	try {
		const [rows] = await pool.query("SELECT 1 + 1 AS result");
		res.json({
			message: "Database connected successfully 🚀",
			data: rows,
		});
	} catch (error) {
		res.status(500).json({
			error: "Database connection failed",
			details: error.message,
		});
	}
});

export default router;
