const express = require('express')
const router = express.Router() 
const bodyParser = require('body-parser')
const userController = require('../controllers/loginController.js')
router.use(bodyParser.urlencoded({extended: true}));

router.get('/', userController.home);
router.post('/login', userController.login);
router.post('/signup', userController.signup);

router.get('/logout',(req,res)=> {
    req.session = null
    res.redirect('/')
})

module.exports = router
