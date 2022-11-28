const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const userRoute = require('./routes/user.js')
const itemRoute = require('./routes/item.js')
const sellerRoute = require('./routes/seller.js')
const dashboardRoute = require('./routes/dashboard.js')
const profileRoute = require('./routes/profile.js')
const cartRoute = require('./routes/cart.js')
const emailRoute = require('./routes/email.js')
var session = require('cookie-session')
const app = express()
var test = "TESTING GIT"

let port = process.env.PORT || 4200
app.listen(port, () => {
    console.log(`app is listening on http://localhost:${port}` );
});


app.set('trust proxy', 1)
app.set('view engine', 'ejs') //view engine (EJS)

app.use(express.static('views'))
app.use(bodyParser.json());
app.use(session({
    name: 'session',
    keys: ['key1', 'key2']
}))

app.use('/', userRoute)
app.use('/items', itemRoute)
app.use('/seller', sellerRoute)
app.use('/dashboard', dashboardRoute)
app.use('/profile', profileRoute)
app.use('/cart', cartRoute)
app.use('/email', emailRoute)

process.on('unhandledRejection', function(reason, promise) {
    console.log(promise);
});
