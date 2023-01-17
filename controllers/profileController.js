const {pool} = require('../model/database.js')

var getProfile = async (req,res, next)=>{
    try{
        await pool.query(`SET SCHEMA 'public'`)
        const {rows} = await pool.query(`SELECT a.account_id, username, first_name, middle_name, last_name, birthdate
                                    FROM profile a JOIN account b ON a.account_id = b.account_id WHERE b.account_id = ($1)`, [req.params.user_id])
        
        const {rows: itemRowsResult} = await pool.query(`SELECT a.item_id, b.inventory_id, account_id, rental_rate, image_path, item_name FROM item a JOIN inventory b 
                                        ON b.item_id = a.item_id WHERE account_id = ($1)`, [req.params.user_id])

        const {rows: userRatingResult} = await pool.query(`SELECT COUNT(rating) as rate_count, ROUND( AVG(rating)::numeric, 1) as average_rating 
                                        FROM user_rating WHERE rating_to = ($1);`, [req.params.user_id])

        const {rows: userProfileResult} = await pool.query(`SELECT a.account_id, phone_num, about, email 
                                        FROM profile a JOIN account b ON a.account_id = b.account_id WHERE a.account_id = ($1);`, [req.params.user_id])


        if(itemRowsResult.length == 0){
            var itemRows = 0
        }
        else if(itemRowsResult){
           var itemRows = itemRowsResult
        }

        res.render('pages/user-profile', { result:rows, 
            user:req.session.username, 
            user_id:req.session.user_id,
            cart_count:req.session.cart_count, 
            currency:req.session.currency,
            profile_id: req.params.user_id,
            itemRows,
            userRatingResult,
            profile: userProfileResult})

       

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

var updateProfile = async(req, res, next) => {
    try{
        var user = req.session.username
        var user_id = req.session.user_id
        var email = req.body.email
        var aboutProfile = req.body.about
        var phoneNum = req.body.phoneNum

        if(!user){
            res.status(401).redirect('pages/error401')
        }        
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)

            if(req.body.profileButton == 1){
                await pool.query(`UPDATE profile SET phone_num = ($1), about = ($2) WHERE account_id = ($3)`, [phoneNum, aboutProfile, user_id])
                res.redirect(`/profile/${user_id}`)
            }
            else if(req.body.profileButton == 2){
                await pool.query(`UPDATE account SET email = ($1) WHERE account_id = ($2)`, [email, user_id])
                await pool.query(`UPDATE profile SET is_verified = 0 WHERE account_id = ($1)`, [user_id])
                res.redirect(`/profile/${user_id}`)
            }            
        }
    }
    catch(ex){

    }
}


module.exports = {
    getProfile,
    setRating,
    updateProfile
}
