/* eslint-disable max-len */
/* eslint-disable quotes */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
/* eslint-disable no-console */
const mysql = require('mysql');
const passportLocalMongoose = require('passport-local-mongoose');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'realappdb',
});

// const server = function () {
//   db.connect((err) => {
//     if (err) throw err;
//     console.log('Connected');
//     // const sql = `CREATE TABLE users (id int AUTO_INCREMENT, username VARCHAR(255), password CHAR(64), PRIMARY KEY (id))`;
//     // db.query(sql, (err, result) => {
//     //   if (err) throw err;
//     //   console.log('User table created !!!');
//     // });
//   });
// };

module.exports = db;
