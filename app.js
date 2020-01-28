const
    express    = require('express'),
    app        = express(),
    bodyParser = require('body-parser'),
    mysql      = require('mysql'),
    session    = require('express-session'),
    flash = require('connect-flash'),
    cookieParser = require('cookie-parser'),
    config     = require('./config.js'),
    connection = mysql.createConnection(config),
    noValue    = '';

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(session({ secret: '123', resave: false, saveUninitialized: false }));
app.use(cookieParser('secret'));
app.use(flash());

setInterval(() => {
    // console.log('loop');
    const createTable = `
    create table if not exists Players(
    Names varchar(20),
    Roles int,
    MaxPlayerCount int)`;
    connection.query(createTable, (err, results, fields) => {
        if (err) { console.log(err.message); }
    });
}, 800);

app.get("/", (req, res) => {
    connection.query(`SELECT * FROM Players`, (err, results, fields) => {
        if (results && results.length > 0) {
            connection.query(`SELECT MaxPlayerCount FROM Players`, (err, r, fields) => {
                var maxPlayers = JSON.stringify(r).substring(19, 20);
                console.log('length ' + results.length, 'mP ' + maxPlayers, results.length > maxPlayers)
                if (results.length > maxPlayers) {
                    return res.render('index', { disablePlayer: 'disabled', disableHost: 'disabled' });
                }
            });
            return res.render('index', { disablePlayer: noValue, disableHost: 'disabled' });
        }
        res.render('index', { disablePlayer: 'disabled', disableHost: noValue});
    });
});

app.get("/host", (req, res) => {
    connection.query(`SELECT Names FROM Players`, (err, results, fields) => {
        if (results && results.length > 0 && JSON.stringify(results).includes("Host")) {
            return res.render('hostGame', { data: results });
        }  
        res.render('host');        
    });
});

app.post("/host", (req, res) => {
    res.redirect('/host');
});

app.post("/host/:PC", (req, res) => {
    var playerCount = req.params.PC;
    const sql = `INSERT INTO Players(Names, Roles, MaxPlayerCount)
                VALUES(?, -1, ?)`;
    connection.query(sql, ['Host', playerCount]);

    res.redirect('/host');
});

var noVsql = { disable: '', placeholderName: '' };

app.get("/player", (req, res) => {
    res.render("player", noVsql)
});

app.post("/player", (req, res) => {
    var name = req.body.username;
    //Duplicate name checker
    connection.query(`SELECT Names FROM Players`, (err, results, fields) => {
        var stringResult = JSON.stringify(results);
        console.log('stringResult: ' + stringResult, 'name: ' + name, '=');
        // console.log('match: ' + stringResult.match(/name/gi), 'RegExp: ' + );

        if (new RegExp(name, 'i').test(stringResult)) {
            // req.flash('duplicate', 'Username taken! Try another username.')
            // return res.render("player", { duplicate: req.flash('duplicate')})
            // res.render('player', { duplicate: req.flash('duplicate')});
            return console.log('Duplicate');
        }
        //Name insertion
        console.log("Unique!");
        console.log('Add.js: ' + name);
        let sql = `INSERT INTO Players(Names, Roles)
                VALUES(?, 0)`;

        connection.query(sql, name);
    });
    res.render("player", { disable: 'disabled', placeholderName: name });
    res.redirect("/player");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running!");
});