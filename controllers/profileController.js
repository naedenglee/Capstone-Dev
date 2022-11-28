const {pool} = require('../model/database.js')

var getProfile = async (req,res, next)=>{
    try{
        await pool.query(`SET SCHEMA 'public'`)
        await pool.query(`SELECT * FROM seller_info WHERE seller_user = $(1)`, [req.params.username])
    }
    catch(ex){
        console.log(`GetProfile Error ${ex}`)
    }
    finally{
        pool.release
        res.render('pages/user-profile', {rows})
        next()
    }
}

module.exports = {
    getProfile
}
