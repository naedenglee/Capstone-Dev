const {pool} = require('../model/database.js')

var getProfile = async (req,res, next)=>{
    try{
        await pool.query(`SET SCHEMA 'public'`)
        const {rows} = await pool.query(`SELECT a.account_id, username, first_name, middle_name, last_name, birthdate
                                    FROM profile a JOIN account b ON a.account_id = b.account_id WHERE b.account_id = ($1)`, [req.params.user_id])
        
        const {rows: itemRows} = await pool.query(`SELECT a.item_id, b.inventory_id, account_id, rental_rate, image_path, item_name FROM item a JOIN inventory b 
                                        ON b.item_id = a.item_id WHERE account_id = ($1)`, [req.params.user_id])


        console.log(itemRows)
        console.log(itemRows[0])
        if(itemRows.length == 0){
            res.render('pages/user-profile', { result:rows, 
                user:req.session.username, 
                user_id:req.session.user_id,
                cart_count:req.session.cart_count, 
                currency:req.session.currency,
                itemRows:0 })
        }
        else if(itemRows){
            res.render('pages/user-profile', { result:rows, 
                user:req.session.username, 
                user_id:req.session.user_id,
                cart_count:req.session.cart_count, 
                currency:req.session.currency,
                itemRows})
        }

       

    }
    catch(ex){
        console.log(`GetProfile Error ${ex}`)
    }
    finally{
        pool.release
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
