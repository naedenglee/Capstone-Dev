const express = require('express')
const errorController = require('../controllers/errorController.js')
const router = express.Router()
const bodyParser = require('body-parser')

router.use(bodyParser.urlencoded({ extended: true, limit: '50mb'}))

router.get('/', errorController.return404)

module.exports =  router 