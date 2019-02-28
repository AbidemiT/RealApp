const express = require("express");
const jwt = require("jsonwebtoken");
const verifyToken = require('./middleware/verifyToken');
const bearerToken = require('express-bearer-token');
const fs = require("fs");
let secret = 'musicApp';
const bodyParser = require("body-parser");
const db = require("./config/database");
const User = require("./models/User");
const port = 3000;

let app = express();

app.set("view engine", "ejs");

app.use("/public", express.static(__dirname + "/public"));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// Test DB
db.authenticate()
  .then(() => console.log("Database Connected"))
  .catch(err => console.log("Error: " + err));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/music", (req, res) => {
  let fileId = req.query.id;
  let file = __dirname + "/music/" + fileId;
  fs.exists(file, exists => {
    if (exists) {
      let rstream = fs.createReadStream(file);
      rstream.pipe(res);
    } else {
      res.send("It's a 404");
      res.end();
    }
  });
});
app.get("/download", (req, res) => {
  let fileId = req.query.id;
  let file = __dirname + "/music/" + fileId;
  fs.exists(file, exists => {
    if (exists) {
      res.setHeader("Content-disposition", "attachment; filename=" + fileId);
      res.setHeader("Content-Type", "application/audio/mpeg3");
      let rstream = fs.createReadStream(file);
      rstream.pipe(res);
    } else {
      res.send("It's a 404");
      res.end();
    }
  });
});

app.get("/songs", verifyToken, (req, res) => {
  console.log(req.token);
  jwt.verify(req.token, secret, (err, authData) => {
    if (err) {
      res.send('Error winks');
    } else {
      res.render("songs");
    }
  });
});


// Register routes
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  User.findOne({
    where: {
      email: req.body.user.email
    }
  }).then(user => {
    if (user !== null) {
      console.log(`user Exist`);
      res.redirect("/register");
    } else {
      User.create({
          username: req.body.user.username,
          email: req.body.user.email,
          phoneNumber: req.body.user.phoneNumber,
          password: req.body.user.password
        })
        .then(() => {
          console.log(`user created`);
          res.redirect("/login");
        })
        .catch(err => console.log(`error: ${err}`));
    }
  });
});

// Login routes
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  User.findOne({
      where: {
        email: req.body.user.email
      }
    })
    .then(user => {
      if (user.email === req.body.user.email) {
        var token = jwt.sign({
          user
        }, secret);
        console.log(`login successful`);
        res.redirect('/songs');
        
      }
    })
    .catch(err => res.redirect("/register"));
});

// Logout
app.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

// format of token
// Authorization: Bearer <access_token>

// function verifyToken(req, res, next) {

//   // Get auth header value
//   const bearerHeader = req.headers["authorization"];
//   console.log(bearerHeader)
//   // check if bearer is undefined
//   if (typeof bearerHeader !== "undefined") {
//     // Split with space
//     const bearer = bearerHeader.split(" ");
//     // get token from bearer array
//     const bearerToken = bearer[1];
//     // set the token
//     req.token = bearerToken;
//     // next middleware
//     next();
//   } else {
//     // Forbidden
//     res.sendStatus(403);
//   }
// }

app.listen(port, "127.0.0.1", () =>
  console.log(`Server Active on port ${port}`)
);