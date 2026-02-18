const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'watchlist',
  password: process.env.DB_PASSWORD || 'Abcd@1234',
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
  
  const query = "SELECT id, name, email, verified, otp, otp_expires_at FROM user";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error querying user table:", err.message);
    } else {
      console.log("DB_RESULTS_START");
      results.forEach(user => {
        console.log(`User: ${user.email} | Verified: ${user.verified} | Name: ${user.name}`);
      });
      console.log("DB_RESULTS_END");
    }
    connection.end();
  });
});
