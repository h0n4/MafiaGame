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
    res.render("home", { duplicate: '', data: ''});
});

app.post("/#", (req, res) => {
    res.render("home", { duplicate: '', data: '' });
})

app.post("/", (req, res) => {

    //Table Creation
    const createTable = `
    create table if not exists Players(
    Names varchar(20),
    Roles int)`;
    connection.query(createTable, (err, results, fields) => {
        if (err) { console.log(err.message); }
        console.log('Table: Table Created')
    });
    //
    
    var name = req.body.username;
    console.log('root insert: ' + name);
    
    //Duplicate name checker
    connection.query(`SELECT Names FROM Players`, (err, results, fields) => {
        var stringResult = JSON.stringify(results);
        console.log('stringResult: ' + stringResult);
        stringResult.substring('', )
        // console.log('StringResults: ' + stringResult, 'name gi: ' + name, 'match: ' + stringResult.match(/name/gi), 'RegExp: ' + new RegExp(name, 'i').test(stringResult));
        var testDuplicate = new RegExp(name, 'i').test(stringResult);
        if (testDuplicate) {
            req.flash('duplicate', 'Username taken! Try another username.');
            res.render('home', { duplicate: req.flash('duplicate'), data: results });
            return console.log('Duplicate');
        }
        //Name insertion
        console.log("Unique!");
        console.log('Add.js: ' + name);
        let sql = `INSERT INTO Players(Names, Roles)
                VALUES(?, 0)`;
        
        connection.query(sql, name);
        res.render('home', { duplicate: '', data: '' });
    });
});

app.post("/clear", (req, res) => {
    connection.query(`DROP TABLE Players`);
    console.log('Clear.js: Successfully dropped table.');
    res.redirect("/");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running!");
});