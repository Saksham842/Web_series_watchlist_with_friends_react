const mysql = require("mysql2");
const fs = require("fs");
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
    fs.writeFileSync("user_report.json", JSON.stringify({ error: err.message }));
    process.exit(1);
  }
  
  connection.query("SELECT id, name, email, verified FROM user", (err, results) => {
    if (err) {
      fs.writeFileSync("user_report.json", JSON.stringify({ error: err.message }));
    } else {
      fs.writeFileSync("user_report.json", JSON.stringify(results, null, 2));
    }
    connection.end();
  });
});
