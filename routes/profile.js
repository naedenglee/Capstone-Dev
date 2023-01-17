const profileController = require('../controllers/profileController.js')
const express = require('express')
const router = express.Router() 

router.get("/:user_id", profileController.getProfile)

router.post('/update', profileController.updateProfile)

module.exports = router
