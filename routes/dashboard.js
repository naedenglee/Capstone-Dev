const express = require('express')
const router = express.Router() 
const dashboardController = require('../controllers/dashboardController.js')
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({extended: true, limit: '50mb'})); 
router.use(bodyParser.json());

router.get('/', dashboardController.viewMainDashboard)

router.get("/user/rentals/ongoing", dashboardController.userOngoingRentals)

router.get("/user/rentals/finished", dashboardController.userFinishedRentals)

router.get('/user/requests', dashboardController.getUserRentalRequests)

router.get("/lessor/rentals/ongoing", dashboardController.lessorOngoingRentals)

router.get("/lessor/rentals/finished", dashboardController.lessorFinishedRentals)

router.get("/reports", dashboardController.getReport)

router.get("/lessor/requests", dashboardController.getRentalRequests)

router.get("/lessor/requests/denied", dashboardController.getDeniedRentalRequests)

router.get('/delivery/confirmation/:rentalId', dashboardController.courierDeliveryPage)

router.get('/return/confirmation/:rentalId', dashboardController.courierReturnPage)

router.get('/courier/confirmation/success', async(req, res, next) => {
   res.render('pages/dashboard/dashboard_courier_success')
})

router.get('/courier/confirmation/failed', async(req, res, next) => {
    res.render('pages/dashboard/dashboard_courier_failed')
})

//POST requests
router.post('/user/rentals/ongoing/extension', dashboardController.userOngoingRentalsExtension)

router.post('/lessor/requests/approve', dashboardController.approveRentalRequest)

router.post('/lessor/requests/deny', dashboardController.denyRentalRequest)

// BAGO 
router.post('/rentals/updateStatus', dashboardController.update_reservation)

router.post("/user/rentals/finished/addRating", dashboardController.addComment)

router.post('/courier/confirmation/:rentalId', dashboardController.updateCourier)

module.exports = router
