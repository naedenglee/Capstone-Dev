const express = require('express')
const router = express.Router() 

router.get("/", (req,res) => {
    res.render('pages/dashboard_main')
})

router.get("/seller/rentals/ongoing", (req,res) => {
    res.render('pages/dashboard_rentals_ongoing')
})

router.get("/requests", (req,res) => {
    res.render('pages/dashboard_requests')
})

router.get("/requests/approved", (req,res) => {
    res.render('pages/dashboard_requests_approved')
})

router.get("/requests/denied", (req,res) => {
    res.render('pages/dashboard_requests_denied')
})

module.exports = router

