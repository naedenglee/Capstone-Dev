const express = require('express')
const sellerController = require('../controllers/sellerController.js')
const router = express.Router() 
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({extended: true}));

router.post('/insert', sellerController.sellerInsert) // Change route from '/seller_insert'
router.get('/items', sellerController.sellerItems)
router.post ('/update/item', sellerController.updateItem)

module.exports = router
