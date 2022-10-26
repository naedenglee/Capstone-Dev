//node modules
const express = require('express')
const axios = require('axios')
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const otpGenerator = require('otp-generator')
var session = require('cookie-session')

//for postgres
const { Client } = require('pg')

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  client.connect()

//app.use
const app = express()
app.use(express.static('views'))

app.use(session({
    name: 'session',
    keys: ['key1', 'key2']
}))

app.use(bodyParser.urlencoded({ extended: false}))
app.set('trust proxy', 1)

let port = process.env.PORT || 4200
app.listen(port, () => {
    console.log(`app is listening on http://localhost:${port}` );
});


//view engine(EJS)
app.set('view engine', 'ejs')

//ROUTES
app.get("/", (req,res) =>{
    var user = req.session.username;
    var cart_count = req.session.cart_count
    res.render('pages/homepage', { user, cart_count })
});

//VALIDATIONof login
app.post("/login", (req,res) =>{
    let userlogin = req.body.user;
    let passlogin = req.body.pass;

    client.query(`SET SCHEMA 'public'`)

    client.query(`SELECT * FROM account WHERE username = '${userlogin}'`, (error, rows) => {
                if(error){
                    res.send('error')
                }
                else if(!error){
                    if(!rows){
                        res.send('error');
                    }
                    else if(rows){
                        
                        validPass = bcrypt.compareSync(passlogin, rows.rows[0].password);
                        if(!validPass){
                            res.send('error')
                        }
                        else if(validPass){
                            req.session.username = userlogin;
                            var user = req.session.username
                            client.query(`SELECT username FROM cart WHERE username = '${user}'`, (error, cart) => {
                                if(error){
                                    console.log('error')
                                }
                                else if(!error){                                    
                                    req.session.cart_count = cart.length
                                    res.redirect('/')
                                }
                            });
                            
                        }
                        
                    }
                    
                }
    });
});

//VALIDATION of signup
app.post("/signup", (req,res) =>{
    if(req.body.password != req.body.password2){
        console.log(err)
        return res.send({
            success: false,
            statusCode: 400
        })
    }
    else{
        var salt = bcrypt.genSaltSync(10);
        var hashed_password = bcrypt.hashSync(req.body.password, salt);

        let sqlQuery ={
            text: `CALL register($1,$2,$3,$4,$5,$6,$7,$8, null)`,
            values: [req.body.username, hashed_password, req.body.email, req.body.fname, null, req.body.lName, req.body.bday, req.body.phone_num]
        }
        client.query(`SET SCHEMA 'public'`)
        client.query(sqlQuery, (err, result) =>{
            let {vaccount_id} = result.rows[0]

            if(err){
                console.log(err)
                return res.send({
                    success: false,
                    statusCode: 400
                })
            }
            else if(vaccount_id != null){ // IF NOT NULL THEN SUCCESS
                console.log(vaccount_id)
                console.log('SUCCESS') 
                return res.redirect('/')
                
            }
            else{
                console.log('ACCOUNT EXISTS') // IF NULL THEN EXISTING
                console.log(vaccount_id)
                return res.send({
                    success: 'ACCOUNT EXISTS',
                    statusCode: 200,
                })
            }
        })
    }
});

//PAGE of items
app.get("/items", (req,res) =>{
    var user = req.session.username
    var cart_count = req.session.cart_count
    client.query(`SET SCHEMA 'test'`)

    client.query('SELECT * FROM item', (error, rows) => {
        if(error){
            console.log('error')
        }
        else if(!error){
            res.render('pages/item-page', { result:rows, user, cart_count })
        }
    });
});

//add to cart button
app.post("/items", (req,res) =>{
    var user = req.session.username
    var item_id = req.body.addtocart
    message = 0
    client.query(`SET SCHEMA 'test'`)

    if(!user){
        res.redirect('/')
    }
    if(user){
        client.query(`SELECT item_id FROM cart WHERE username = '${user}' AND item_id = ${item_id}`, (error, rows) => {
            if(error){
                console.log('error')
            }
            else if(!error){
                if(rows.length){
                    console.log('Item is already in the cart!')
                    
                    res.redirect('/items')
                }
                else if(rows.length == 0){
                    client.query(`INSERT INTO cart VALUES('${user}', '${item_id}', 1) `, (error, rows) => {
                        if(error){
                            console.log('error')
                        }
                        else if(!error){
                            req.session.cart_count += 1
                            res.redirect('/items')
                        }
                    });
                }
            }
        });
    }
})

//VIEWING of a specific item
app.get("/items/view/:id", (req,res) =>{
    var itemId = req.params.id
    var user = req.session.username
    var cart_count = req.session.cart_count
    client.query(`SET SCHEMA 'test'`)

    client.query(`SELECT * FROM item WHERE item_id = ${itemId}`, (error, rows) => {
        if(error){
            console.log('error')
        }
        else if(!error){
            client.query(`UPDATE item SET clicks = clicks + 1 WHERE item_id = ${itemId}`, (error) => {
                if(error){
                    console.log('error')
                }                
            });
            client.query(`SELECT start, end, reservee FROM reserved_date WHERE item_id = ${itemId}`, (error, dates) => {
                if(error){
                    console.log('error')
                }
                else if(!error){
                    res.render('pages/view-item', { rows, user, result:dates, cart_count })
                    // { 'start': moment('<%= date.start_date %>'), 'end': moment('<%= date.start_date %>') }
                }
                
            });
        }
    });
});

//availability(reservation calendar)
app.post("/items/view/:id", (req,res) =>{
    var daterange = req.body.daterange
    var startDate
    var endDate
    [startDate, endDate] = daterange.split(' - ');
    console.log(`${startDate}-${endDate}`)
});

//VIEW profile
app.get("/profile/:username", (req,res) =>{

    var username = req.params.username
    client.query(`SET SCHEMA 'test'`)

    client.query(`SELECT * FROM seller_info WHERE seller_user = '${username}'`, (error, rows) => {
        if(error){
            // res.status(404)
        }
        else if(!error){
            res.render('pages/user-profile', {rows})
        }
    });
});

app.get("/sendmail", (req,res) => {
    async function main() {

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.sendgrid.net",
            port: 465,
            auth: {
                user: "apikey",
                pass: "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"
          },
        });
      
        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: '"Naedenglee" <naedenglee.capstone@gmail.com>', // sender address
          to: "artaberdo@gmail.com", // list of receivers
          subject: "TEST SENDGRID", // Subject line
          text: "pak uuuu galing node tooo", // plain text body
          html: "<b>pak uuuu galing node tooo</b><br><button>Login</button>", // html body
        });
      
        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      }
      
      main().catch(console.error);
});

app.get("/emailform", (req,res) => {
    res.render('pages/try_emailform')
});

app.post("/emailform", (req,res) => {
    var email = req.body.email
    var otp = otpGenerator.generate(6, { upperCaseAlphabets: true, specialChars: false });
    req.session.emailotp = otp
    
    async function main() {

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.sendgrid.net",
            port: 465,
            auth: {
                user: "apikey",
                pass: "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"
          },
        });
      
        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: '"Naedenglee" <naedenglee.capstone@gmail.com>', // sender address
          to: `${email}`, // list of receivers
          subject: "EMAIL OTP - Mang-Hiram", // Subject line
          text: "Hello Nae", // plain text body
          html: `<b>OTP: ${req.session.emailotp}</b><br>`, // html body
        });
      
        console.log("Message sent: %s", info.messageId);
        res.render('pages/try_validateemail', { email })
      }
      
      main().catch(console.error);

});

app.post("/validate_email", (req,res) => {
    var otp = req.body.otp

    if(otp == req.session.emailotp){
        console.log('OTP matched!')
        res.send('OTP matched!')
        req.session.otp = null
    }
    else if(otp != req.session.emailotp){
        console.log('error')
        res.send('error')
    }

});

//logout
app.get('/logout',function(req,res){
    req.session = null
    res.redirect('/')
});
