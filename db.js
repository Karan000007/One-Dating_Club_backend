// var mysql = require('mysql');
// var connection = mysql.createConnection({
//     host     : 'localhost',
//     user     : 'root',
//     password : '',
//     database : 'onedatingclub',
//     charset : 'utf8mb4'
// });

// connection.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
// });

// module.exports = connection;


require('dotenv').config();
var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : process.env.DB_HOST,
    port     : process.env.DB_PORT,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    charset  : 'utf8mb4'
});

connection.connect(function(err) {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        throw err;
    }
    console.log("Connected to MySQL");
});

module.exports = connection;
