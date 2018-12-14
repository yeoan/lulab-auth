var express = require("express")
var app = new express()
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var path = require('path')
var pg = require('pg')
var config = require('./config')
var session = require('express-session')
const bcrypt = require('bcrypt')
var passport = require('passport')
var Strategy = require('passport-local').Strategy;
var pgSession = require('connect-pg-simple')(session);
var db = require('./db');

const saltRounds = 10;

passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));


  passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

app.use(express.static(__dirname + "/public"));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Authorization, X-Requested-With, Content-Type, X-HTTP-Method");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.header("Content-Type", "application/json")
  next();
});

app.use(require('cookie-parser')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  store: new pgSession({
    pg : pg,                                  // Use global pg-module
    conString : 'http://127.0.0.1:5432', // Connect using something else than default DATABASE_URL env variable
    tableName : 'session'               // Use another table-name than the default "session" one
  }),
  secret: 'keyboard cat',
  resave: false, saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.get("/register", function(req, resp, next) {
    resp.redirect("./register.html");
});

//'INSERT INTO "public"."users"("username", "email", "password") VALUES('+'\''+uname+'\',\''+email+'\',\''+pass+'\');'
app.post("/register", function(req, resp, next) {
  var client = new pg.Client(config.db);

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  // Store hash in your password DB.
  client.connect(err => {
        if (err) {
          resp.send({result:'conn failure'})
        }
        else {
            client.query('INSERT INTO "public"."users"("username", "email", "password") VALUES('+'\''+req.body.username+'\',\''+req.body.email+'\',\''+hash+'\');')
                .then(res => {
                  console.log(res)
                  resp.send({result:'regis success'})
                })
                .catch(err => {
                    console.log(err);
                    resp.send({result:'regis failure'})
                });
        }
    });
  });
});

app.get("/login", function(req, resp, next) {
  if(req.user){
    resp.redirect('/main.html')
  }else{
    resp.redirect('/login.html')
  }
});

app.post("/login", passport.authenticate('local', { failureRedirect: '/login' }),function(req, resp, next) {
    resp.redirect('/main.html')
});

function ensureAuthenticated(req, res, next){
  if(req.user){
    return next();
  } else {
    res.redirect('/login.html')
  }
}

app.get("/main",ensureAuthenticated,function(req, resp, next) {
    resp.redirect('/main'+req.user.username)
});


//Start Server
app.listen(3000, function(err) {
    if (err)
        console.log(err.message);
    else
        console.log("Server is running");
});
