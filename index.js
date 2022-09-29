const express = require('express');
// var mysql = require('mysql');
const { Client } = require('pg');
var mysql = require('mysql')
const app = express();
const axios = require('axios')
const bcrypt = require('bcryptjs')

//bodyparser for ejs 
const bodyParser = require('body-parser') 

//cookie session to store cookies
var session = require('cookie-session');

//geocoder for google maps api
var geocoder = require('geocoder');

app.use(express.static('views'))
 
app.use(session({
    name: 'session',
    keys: ['key1', 'key2']
  }))

let port = process.env.PORT || 4200;

app.use(bodyParser.urlencoded({ extended: false }));
app.set('trust proxy', 1);


//db connection(mysql)
// const client = new Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {
//       rejectUnauthorized: false
//     }
//   });
//   client.connect()

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'na33',
    database: 'capstone_testdb',
    port: 3306
  });

  connection.connect(function(err) {
    if(err){
        console.log("error");
    }
    else {
        console.log("connected");
    }
  });

//view engine
app.set('view engine', 'ejs')

//render home page using express
app.get("/", (req,res) =>{
    res.redirect('/homepage')
});

//homepage
app.get("/homepage", (req,res) =>{
    var user = req.session.username;
    if(req.session.username){
        res.render('pages/homepage', { user });
        res.render('pages/signup', { user });
    }
    else if(!req.session.username){
        res.send("Homepage without session");
        
    }
    
});

//login page
app.get("/login", (req,res) =>{
    res.render('pages/login');
});

// app.get("/navbar", (req,res) =>{
//     data1 = 'heyoo'
//     res.render('pages/navbar', { data1 });
//     res.redirect('/login')
// });

//goes to here after clicking submit. this code validates login
app.post("/login", (req,res) =>{
    let userlogin = req.body.user;
    let passlogin = req.body.pass;
    
    // const query = {
    //     name: 'fetch account',
    //     text: 'SELECT * FROM accounts WHERE user_name = $1 AND password = $2',
    //     values: [userlogin, passlogin]
    // }
    connection.query(`SELECT * FROM accounts WHERE user_name = '${userlogin}'`, (error, rows) => {
                if(error){
                    res.send('error')
                }
                else if(!error){
                    if(!rows){
                        res.send('error');
                    }
                    else if(rows){
                        validPass = bcrypt.compareSync(passlogin, rows[0].password);
                        if(!validPass){
                            res.send('error')
                        }
                        else if(validPass){
                            req.session.username = userlogin;
                            res.redirect('/homepage')
                        }
                        
                    }
                    
                }
    });
});

//testing lang tatanggalin din mamaya 
app.get("/db", (req,res) =>{
    connection.query(`SELECT * FROM accounts WHERE user_name = 'nae' AND password = 'qwe'`, (error, rows) => {
        if(error){
            res.send(rows)
        }
        else if(!error){
            res.send(rows)
            if(rows.length == 0){
                res.send('error');
            }
            else if(rows.length > 0){
                res.send(rows)
            }
            // res.render('pages/index', { rows } );
        }
});
})

app.get("/signup", (req,res) =>{
    res.render('pages/signup');
});

app.post("/signup", (req,res) =>{
    let fname = req.body.fname;
    let lname = req.body.lname;
    let phone_num = req.body.phone_num;
    let username = req.body.user;
    let password = req.body.pass;
    let password2 = req.body.pass2;

    connection.query(`SELECT * FROM accounts WHERE user_name = '${username}'`, (error, rows) => {
        if(error){
            console.log("error")
        }
        else if(!error){
            if(rows.length > 0){
                res.send("Username already taken");
                res.redirect('/signup');
            }
            else if(!rows.length){
                if(password === password2){

                    var salt = bcrypt.genSaltSync(10);
                    var hashed_password = bcrypt.hashSync(password, salt);
                    connection.query(`INSERT INTO accounts(user_name, password) VALUES('${username}', '${hashed_password}')`, (error, rows) =>{
                        if(error) throw error;
                    });
                    connection.query(`INSERT INTO user_information(first_name, last_name, phone_number) VALUES('${fname}', '${lname}', '${phone_num}')`, (error, rows) =>{
                        if(error) throw error;
                    });
                    connection.query(`INSERT INTO currency(user_name) VALUES('${username}')`, (error, rows) =>{
                        if(error) throw error;
                    });
                    res.redirect('/login');

                    // try {
                        
                    //     console.log(hash)
                    // } catch (e) {
                    //     console.log(e)
                    //     res.status(500).send('Something went wrong')
                    // }

                }
            }
            // res.render('pages/index', { rows } );
        }
    });

});

app.get("/items", (req,res) =>{
    connection.query('SELECT * FROM item', (error, rows) => {
        if(error){
            console.log('error')
        }
        else if(!error){
            res.render('pages/all_items', { result:rows });
        }
    });
});

app.get("/items/view/:id", (req,res) =>{
    var itemId = req.params.id
    var username = req.session.username
    connection.query(`SELECT * FROM item WHERE item_id = ${itemId}`, (error, rows) => {
        if(error){
            console.log('error')
        }
        else if(!error){
            connection.query(`UPDATE item SET clicks = clicks + 1 WHERE item_id = ${itemId}`, (error) => {
                if(error){
                    console.log('error')
                }
                else if(!error){
                    //{ } can have many items
                    // res.render('pages/view_item', { rows });
                    res.render('pages/item-list', { rows, username})
                    
                }
            });
        }
    });
    
});

app.get("/profile/:username", (req,res) =>{

    var username = req.params.username
    connection.query(`SELECT * FROM seller_info WHERE seller_user = '${username}'`, (error, rows) => {
        if(error){
            // res.status(404)
        }
        else if(!error){
            res.render('pages/user_profile', {rows})
        }
    });
    
});

app.post("/items/view/:id", (req,res) =>{
    var daterange = req.body.daterange
    var startDate
    var endDate
    [startDate, endDate] = daterange.split(' - ');
    console.log(`start date: ${startDate}   end date: ${endDate}`)
    
});


app.get("/location", (req,res) => {
    res.send('hello')
    async function doGetRequest() {
        let res = await axios.get('https://api.opencagedata.com/geocode/v1/json?q=3572+mag+araullo&key=8c247b3959294b92a568bb45668556f1');
        let data = res.data;

        console.log(data.results[0].geometry.lat)
        console.log(data.results[0].geometry.lng)

        }
      doGetRequest();
})

app.get("/newlogin", (req,res) => {
    res.render('pages/newlogin')
})
//logout logic (ilalagay pa sa button)
app.get('/logout',function(req,res){
    req.session.destroy();
    res.redirect('/homepage')
    });

app.listen(port, () => {
    console.log(`app is listening on port http://localhost:${port}` );
});
