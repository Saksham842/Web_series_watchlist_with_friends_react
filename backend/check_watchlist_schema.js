const connection = require("./config/db");

connection.query("DESCRIBE watchlist", (err, results) => {
    if (err) {
        console.error("Error describing watchlist:", err);
    } else {
        console.log("Watchlist table structure:", results);
    }
    connection.end();
});
