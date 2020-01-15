const app = require('express')(),
    bodyParser = require('body-parser'),
    mysql = require('mysql'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    flash = require('req-flash'),
    config = require('./config.js'),
    connection = mysql.createConnection(config);;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: '123', resave: false, saveUninitialized: false }));
app.use(flash());

app.get("/", (req, res) => {
    res.render("home");
});

app.post("/newPlayer", (req, res) => {

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
    console.log('root: inserting >' + name);
    
    //Duplicate name checker
    connection.query(`SELECT Names FROM Players`, (err, results, fields) => {
        var stringResult = JSON.stringify(results);
        if (stringResult.match(/name/gi)) {
            req.flash('success', 'You are successfully using req-flash');
            res.render('home', {newPlayer: req.flash('success')});
            return console.log("Duplicate");
            //
            // SEND USER VISIBLE ERROR MESSAGE
            //
            
        }
        //Name insertion
        console.log("Unique!");
        console.log('Add.js: ' + name);
        let sql = `INSERT INTO Players(Names, Roles)
                VALUES(?, 0)`;

        connection.query(sql, name);
        res.render('home');
        //
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