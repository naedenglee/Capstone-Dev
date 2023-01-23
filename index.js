const express = require('express')
const app = express()
const axios = require('axios')
const bodyParser = require('body-parser')
const userRoute = require('./routes/user.js')
const itemRoute = require('./routes/item.js')
const sellerRoute = require('./routes/seller.js')
const dashboardRoute = require('./routes/dashboard.js')
const profileRoute = require('./routes/profile.js')
const cartRoute = require('./routes/cart.js')
const emailRoute = require('./routes/email.js')
const errorRoute = require('./routes/errorRoute.js')
const searchRoute = require('./routes/search.js')
const rentalRoute = require('./routes/rental.js')
const agreementRoute = require('./routes/terms.js')
const chatRoute = require('./routes/chat.js')
const {CacheInventory} = require('./controllers/cache.js')
var session = require('cookie-session')

let port = process.env.PORT || 9000
app.listen(port, () => {
    console.log(`app is listening on http://localhost:${port}` );
});

CacheInventory() // REDIS CACHE FOR INVENTORY

app.set('trust proxy', 1)
app.set('view engine', 'ejs') //view engine (EJS)

app.use(express.static('views'))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb'}))
app.use(session({
    name: 'session',
    keys: ['key1', 'key2', 'key3']
}))

app.use('/', userRoute)
app.use('/items', itemRoute)
app.use('/seller', sellerRoute)
app.use('/dashboard', dashboardRoute)
app.use('/profile', profileRoute)
app.use('/cart', cartRoute)
app.use('/email', emailRoute)
app.use('/chat', chatRoute)
app.use('/search', searchRoute)
app.use('/rental', rentalRoute)
app.use('/rentalAgreement', agreementRoute)
app.use('*', errorRoute)

process.on('unhandledRejection', function(reason, promise) {
    console.log(promise);
});
