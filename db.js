const  mysql  = require('mysql2');
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});


connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
  }
  console.log('connected as id ' + connection.threadId);
});

module.exports = connection;