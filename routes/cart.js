const cartController = require('../controllers/cartController.js')
const express = require('express')
const router = express.Router() 
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({extended: true, limit: '50mb'})); 
router.use(bodyParser.json());

router.get("/", cartController.getCart)
router.post("/remove/:cart_id", cartController.removeCart) 

module.exports = router
