const express = require('express')
const router = express.Router() 
const dashboardController = require('../controllers/dashboardController.js')
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({extended: true, limit: '50mb'})); 
router.use(bodyParser.json());

router.get('/', dashboardController.viewMainDashboard)

router.get("/user/rentals/ongoing", dashboardController.userOngoingRentals)

router.get("/user/rentals/finished", (req,res) => {
    res.render('pages/dashboard/dashboard_user_rentals_finished')
})

router.get("/lessor/rentals/ongoing", (req,res) => {
    res.render('pages/dashboard/dashboard_owner_rentals_ongoing')
})

router.get("/lessor/rentals/finished", (req,res) => {
    res.render('pages/dashboard/dashboard_owner_rentals_finished')
})

router.get("/lessor/requests", (req,res) => {
    res.render('pages/dashboard/dashboard_requests')
})

router.get("/lessor/requests/approved", (req,res) => {
    res.render('pages/dashboard/dashboard_requests_approved')
})

router.get("/lessor/requests/denied", (req,res) => {
    res.render('pages/dashboard/dashboard_requests_denied')
})

//POST requests
router.post("/user/rentals/ongoing/extension", dashboardController.userOngoingRentalsExtension)

module.exports = router

