const express = require('express')
const chatController = require('../controllers/chat/chatController.js')
const router = express.Router() 
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({extended: true, limit: '50mb'})); 
router.use(bodyParser.json());
//availability(reservation calendar)
router.get("/subscribe", chatController.subs) //
router.get("/show/:chat_id/:room_id", chatController.showMessages) 
router.post("/show/:chat_id/:room_id", chatController.sendChat) 

module.exports = router

