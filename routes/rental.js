const express = require('express')
const router = express.Router() 
const rentalController = require('../controllers/rentalController.js')
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({extended: true, limit: '50mb'})); 
router.use(bodyParser.json());

router.get('/view/:rental_id', rentalController.viewRental)
router.get('/view/delivery/:rental_id', rentalController.viewDeliveryConfirmation)

module.exports = router
