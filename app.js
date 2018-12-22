/* eslint-disable prefer-destructuring */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mysql = require('mysql');
const flash = require('connect-flash');

const crypto = require('crypto');

// const BetterMemoryStore = require(`${__dirname}/memory`);
const db = require('./server');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(require('express-session')({
  secret: 'Real app secret',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use('local', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true, // passback entire req to call back
}, (req, username, password, done) => {
  if (!username || !password) {
    return done(null, false);
  }
  let salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
    console.log(err);
    console.log(rows);
    if (err) {
      return err;
    }
    if (!rows.length) {
      return done(null, false);
    }
    salt = `${salt}${password}`;
    const encPassword = crypto.createHash('sha1').update(salt).digest('hex');
    const dbPassword = rows[0].password;

    if (!(dbPassword === encPassword)) {
      return done(null, false);
    }

    return done(null, rows[0]);
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.query(`SELECT * FROM users WHERE id = ${id}`, (err, rows) => {
    done(err, rows[0]);
  });
});

// ==============
// ROUTES
// ==============
app.get('/', (req, res) => {
  res.render('home');
});

// Login Logic
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {

});
// Secret Route
app.get('/secret', (req, res) => {
  res.render('secret');
});

// Sign up Logic
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', passport.authenticate('local', {
  successRedirect: '/login',
  failureRedirect: '/register',
  failureFlash: true,

}), (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const post = {
    username,
    password,
  };
  const sql = 'INSERT INTO users SET ?';
  const query = db.query(sql, post, (err, result) => {
    if (err) throw err;
    res.redirect('login');
  });
});

// eslint-disable-next-line no-console
app.listen(3500, '127.0.0.1', () => console.log('Realapp Active on port 3500 ..'));
