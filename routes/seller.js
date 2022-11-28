const express = require('express')
const sellerController = require('../controllers/sellerController.js')
const router = express.Router() 
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({extended: true}));

router.post('/insert', sellerController.sellerInsert) // Change route from '/seller_insert'

module.exports = router
