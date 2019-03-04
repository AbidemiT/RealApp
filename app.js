const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const verifyToken = require('./middleware/verifyToken');
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const db = require("./config/database");
const User = require("./models/User");
const port = 3000;

let secret = "musicApp";
let app = express();
let mv = require('mv');
let mkdirp = require('mkdirp');
let multer = require('multer');
let rand;
let path = require('path');
let LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

let storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, '/upload');
  },
  filename: (req, file, callback) => {
    rand = Date.now() + path.extname(file.originalname);
    callback(null, file.fieldname + '-' + rand);
  }
});

let upload = multer({storage})

app.set("view engine", "ejs");

app.use("/public", express.static(__dirname + "/public"));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
  next();
});
app.use(fileUpload());

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
  jwt.verify(req.token, secret, (err, authData) => {
    if (err) {
      res.send("Error winks");
    } else {
      res.render("songs");
    }
  });
});

app.get("/addAudio", (req, res) => {
  res.render('addAudio');
});

app.post("/addAudio",upload.single('uploadedFile'), (req, res) => {
  console.log(req.body.uploadedFile)
  console.log(__dirname + '/' + req.body.uploadedFile.path);
  res.send(rand);
  // if (Object.keys(req.body.uploadedFile).length == 0) {
  //   return res.status(400).send('No files were uploaded.');
  // }

  // let uploadedFile = req.body.uploadedFile;
  // let path = __dirname +'/music/comedy'
  // mkdirp(path, (err, made) => {
  //   if (err) {
  //     console.log(err)
  //   }
  //   console.log(made)
  //   mv(made +'/' + uploadedFile, __dirname + '/music/comedy/' + uploadedFile, (err) => {
  //     if (err) {
  //       return res.status(500).send(err);
  //     }
  //     res.send('File uploaded!');
  //   })
  // });
  
})

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
          },
          secret
        );
        console.log(`login successful`);
        localStorage.setItem('token', token);
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



app.listen(port, "127.0.0.1", () =>
  console.log(`Server Active on port ${port}`)
);