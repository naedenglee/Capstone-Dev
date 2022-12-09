const express = require('express')
const itemController = require('../controllers/itemController.js')
const router = express.Router() 
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({extended: true}));

router.use(bodyParser.json());
//availability(reservation calendar)
router.get("/", itemController.allItemView) //All Item Page
router.get("/view/:id", itemController.viewItem) //View Specific item
router.post("/view/:id", itemController.itemCalendar) //View Specific item Calendar
router.post('/view/:id/reserve', itemController.itemReservation) //Add to cart and Reservations

module.exports = router
