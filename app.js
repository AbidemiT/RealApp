/* eslint-disable no-unused-vars */
const express = require('express');
const mysql = require('mysql');

// let db = mysql.createConnection({
//   host: 'localhost',
//   user: 'me',
//   password: 'secret',
//   database: 'my_db',
// });

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('home');
});

// eslint-disable-next-line no-console
app.listen(3500, '127.0.0.1', () => console.log('Realapp Active on port 3500 ..'));
