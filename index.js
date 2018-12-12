var express = require("express")
var app = new express()
var bodyParser = require('body-parser')
var path = require('path')
var pg = require('pg')
var config = require('./config')

// var QueryGetPlans = function(callback) {
//     var client = new pg.Client(config.db);
//     client.connect(err => {
//         if (err) throw err;
//         else {
//           console.log('good c')
//         }
//     });
//
// }

//QueryGetPlans();

app.use(express.static(__dirname + "/public"));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Authorization, X-Requested-With, Content-Type, X-HTTP-Method");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.header("Content-Type", "application/json")
  next();
});

app.use(bodyParser.json());


app.post("/register", function(req, resp, next) {
    console.log(req.body.username)
});

// Not found page
app.get("*", function(req, resp, next) {
    resp.end("Not found page");
});

//Start Server
app.listen(3000, function(err) {
    if (err)
        console.log(err.message);
    else
        console.log("Server is running");
});
