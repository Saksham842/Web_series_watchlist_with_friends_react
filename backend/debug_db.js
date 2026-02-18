const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'watchlist',
  password: 'Abcd@1234'
});

connection.connect();
connection.query('SELECT * FROM genres', (err, results) => {
  if (err) {
    console.error('Error fetching genres:', err);
  } else {
    console.log('Genres found:', results);
  }
  connection.end();
});
