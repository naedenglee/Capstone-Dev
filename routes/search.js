
const express = require('express')
const redisController = require('../controllers/searchController.js')
const router = express.Router() 
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({extended: true, limit: '50mb'})); 
router.use(bodyParser.json());

router.get("/", redisController.search_text) //All Item Page
router.get("/category", redisController.getCategory) //All Item Page
router.get("/seller_list", redisController.sellerItemList) //All Item Page
//router.get("/view/:id", redisController.viewItem) //View Specific item

module.exports = router
