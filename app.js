const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mysql = require('mysql'),
    session = require('express-session'),
    flash = require('req-flash'),
    config = require('./config.js'),
    connection = mysql.createConnection(config);;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(session({ secret: '123', resave: false, saveUninitialized: false }));
app.use(flash());

app.get("/", (req, res) => {
    res.render("index");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running!");
});