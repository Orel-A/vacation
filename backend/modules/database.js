const mysql = require("promise-mysql");

const connectionsObj = {
  host: "localhost",
  user: "root",
  password: "root"
};

// Create database skeleton if not already exists
let connection = null;
mysql
  .createConnection(connectionsObj)
  .then(con => {
    connection = con;
    con.query("CREATE DATABASE IF NOT EXISTS website");
    con.query("USE website");

    con.query(`CREATE TABLE IF NOT EXISTS users (
            user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            first_name VARCHAR(45) NOT NULL,
            last_name VARCHAR(45) NOT NULL,
            user_name VARCHAR(45) NOT NULL,
            pass_hash CHAR(32) NOT NULL,
            pass_salt CHAR(16) NOT NULL,
            is_admin BOOLEAN NOT NULL,
            PRIMARY KEY (user_id),
            UNIQUE KEY (user_name)
            )`);

    con.query(`CREATE TABLE IF NOT EXISTS vacations (
            vacation_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            description VARCHAR(400) NOT NULL,
            image VARCHAR(200) NOT NULL,
            destination VARCHAR(45) NOT NULL,
            price FLOAT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            PRIMARY KEY (vacation_id)
            )`);

    con.query(`CREATE TABLE IF NOT EXISTS sessions (
            session_id CHAR(64) NOT NULL,
            user_id INT UNSIGNED NOT NULL,
            expires DATETIME NOT NULL,
            PRIMARY KEY (session_id),
            UNIQUE KEY (user_id)
            ) ENGINE = MEMORY`); // Sessions table should be in memory for fast fetching

    con.query(`CREATE TABLE IF NOT EXISTS vacation_followers (
            user_id INT UNSIGNED NOT NULL,
            vacation_id INT UNSIGNED NOT NULL,
            PRIMARY KEY (user_id, vacation_id)
            )`);
    //CONSTRAINT FOREIGN KEY (user_id) REFERENCES users (user_id),
    //CONSTRAINT FOREIGN KEY (vacation_id) REFERENCES vacations (vacation_id)

    return con.query("SELECT COUNT(*) AS total FROM users");
  })
  .then(res => {
    let rows = res[0].total;
    if (!rows)
      connection.query(
        "INSERT INTO users (first_name, last_name, user_name, pass_hash, pass_salt, is_admin) VALUES ('Orel', 'Amram', 'Admin', 'fa3c37cdafabadd6c416991ade7da473', '75e1afa51a42b3de', '1')"
      );
    connection.end();
  })
  .catch(() => {
    if (connection) connection.end();
  });

const pool = mysql.createPool({
  ...connectionsObj,
  database: "website",
  connectionLimit: 5 // my 1 core VPS is weak
});

module.exports = pool;
