const express = require('express')
const router = express.Router() 
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({extended: true}));

router.get('/', async(req, res,next)=>{
    res.render('pages/terms_of_service')
})

module.exports = router