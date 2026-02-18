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
  
  const query = "UPDATE user SET verified = 1 WHERE email = 'sakshamhans51@gmail.com'";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error updating user:", err.message);
    } else {
      console.log("✅ User 'sakshamhans51@gmail.com' is now verified.");
    }
    connection.end();
  });
});
