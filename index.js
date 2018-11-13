var express = require("express")
var app = new express()
var bodyParser = require('body-parser')
var path = require('path')

app.use(express.static(__dirname + "/public"));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Authorization, X-Requested-With, Content-Type, X-HTTP-Method");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.header("Content-Type", "application/json")
  next();
});

app.use(bodyParser.json());

//Start Server
app.listen(3000, function(err) {
    if (err)
        console.log(err.message);
    else
        console.log("Server is running");
});


// Not found page
app.get("*", function(req, resp, next) {
    resp.end("Not found page");
});
