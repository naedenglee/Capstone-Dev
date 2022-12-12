const {pool} = require('../model/database.js')

var getProfile = async (req,res, next)=>{
    try{
        await pool.query(`SET SCHEMA 'public'`)
        const {rows} = await pool.query(`SELECT * FROM profile WHERE seller_user = ($1)`, [req.params.username])
    }
    catch(ex){
        console.log(`GetProfile Error ${ex}`)
    }
    finally{
        pool.release
        res.render('pages/user-profile', rows)
        next()
    }
}

var setRating = async(req, res, next) => {
    try{
        await pool.query(`SET SCHEMA 'public'`)
        await pool.query(`INSERT INTO <<tablename>>(item_id, rating, comment)`, [req.body.comment, req.body.rating, req.body.item_id])
    }
    catch(ex){
        console.log(`setRate Error ${ex}`)
    }
    finally{
        pool.release
        res.redirect('/dashboard')
        next()
    }
}


module.exports = {
    getProfile,
    setRating
}
