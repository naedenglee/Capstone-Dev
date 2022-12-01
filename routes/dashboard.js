const express = require('express')
const router = express.Router() 

router.get("/", (req,res) => {
    res.render('pages/dashboard_main')
})

router.get("/user/rentals/ongoing", (req,res) => {
    res.render('pages/dashboard_user_rentals_ongoing')
})

router.get("/user/rentals/finished", (req,res) => {
    res.render('pages/dashboard_user_rentals_finished')
})

router.get("/lessor/rentals/ongoing", (req,res) => {
    res.render('pages/dashboard_owner_rentals_ongoing')
})

router.get("/lessor/rentals/finished", (req,res) => {
    res.render('pages/dashboard_owner_rentals_finished')
})

router.get("/lessor/requests", (req,res) => {
    res.render('pages/dashboard_requests')
})

router.get("/lessor/requests/approved", (req,res) => {
    res.render('pages/dashboard_requests_approved')
})

router.get("/lessor/requests/denied", (req,res) => {
    res.render('pages/dashboard_requests_denied')
})

module.exports = router

