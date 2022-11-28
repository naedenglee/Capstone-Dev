
const profileController = require('../controllers/profileController.js')
const express = require('express')
const router = express.Router() 
router.get("/:username", profileController.getProfile)

module.exports = router
