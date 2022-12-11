
const express = require('express')
const emailController = require('../controllers/emailController.js')
const router = express.Router() 
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({extended: true}));

router.get('/check-verified', emailController.checkVerified) // get /item/listing
router.post('/validate_email', emailController.emailValidate)

module.exports = router
