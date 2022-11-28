const cartController = require('../controllers/cartController.js')
const express = require('express')
const router = express.Router() 

router.get("/", cartController.getCart)
router.post("/remove/:cart_id", cartController.removeCart) 

module.exports = router
