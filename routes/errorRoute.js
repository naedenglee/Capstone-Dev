const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const errorController = require('../controllers/errorController.js')
router.use(bodyParser.urlencoded({ extended: true, limit: '50mb'}))

router.get('/', errorController.return404)

module.exports =  router 