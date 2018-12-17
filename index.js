const express = require("express")
const app = new express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')
const pg = require('pg')
const config = require('./config')
const session = require('express-session')
const bcrypt = require('bcrypt')
const passport = require('passport')
const Strategy = require('passport-local').Strategy;
const pgSession = require('connect-pg-simple')(session);
const db = require('./db');


const saltRounds = 10;

passport.use(new Strategy(
  function(username, password, done) {
    // db.users.findByUsername(username, function(err, user) {
    //   if (err) { return cb(err); }
    //   if (!user) { return cb(null, false); }
    //   if (user.password != password) { return cb(null, false); }
    //   return cb(null, user);
    // });
    let client = new pg.Client(config.db);
    client.connect(err => {
          if (err) {
            console.log(err)
          }
          else {
            const query = {
              name: 'fetch-user',
              text: 'SELECT * FROM users WHERE email = $1',
              values: [username]
            }
              client.query(query)
                  .then(resp => {
                    bcrypt.compare(password, resp.rows[0].password, function(err, res) {
                      if(res){
                        return done(null,resp.rows[0])
                      }
                    });
                    client.end();
                  })
                  .catch(err => {
                      console.log(err);
                  });
          }
      });
  }));


  passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, done) {
  // db.users.findById(id, function (err, user) {
  //   if (err) { return cb(err); }
  //   cb(null, user);
  // });
  let client = new pg.Client(config.db);
  client.connect(err => {
        if (err) {
          console.log(err)
        }
        else {
          const query = {
            name: 'fetch-user',
            text: 'SELECT * FROM users WHERE id = $1',
            values: [id]
          }
            client.query(query)
                .then(resp => {
                  return done(null, resp.rows[0])
                  client.end();
                })
                .catch(err => {
                    console.log(err);
                });
        }
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

app.post("/register", function(req, resp, next) {
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  // Store hash in your password DB.
  let client = new pg.Client(config.db);
  client.connect(err => {
        if (err) {
          res.send({result:'conn failure'})
        }
        else {
            client.query('INSERT INTO "public"."users"("username", "email", "password") VALUES('+'\''+req.body.username+'\',\''+req.body.email+'\',\''+hash+'\');')
                .then(res => {
                  console.log(res)
                  resp.send({result:'regis success'})
                  client.end();
                })
                .catch(err => {
                    console.log(err);
                    res.send({result:'regis failure'})
                });
        }
    });
  });
});

app.get("/login", function(req, resp, next) {
  resp.setHeader('Content-Type', 'application/json');
  if(req.user){
    resp.json({result: 'have logined'})
  }else{
    resp.redirect('/login.html')
  }
});

app.post("/login", passport.authenticate('local', { failureRedirect: '/login' }),function(req, resp, next) {
  console.log('login post')
    resp.redirect('http://yao.walsin.com')
});

function ensureAuthenticated(req, resp, next){
  if(req.user){
    return next();
  } else {
    resp.redirect('/login.html')
  }
}


//Start Server
app.listen(3000, function(err) {
    if (err)
        console.log(err.message);
    else
        console.log("Server is running");
});
