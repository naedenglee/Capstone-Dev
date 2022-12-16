const {pool} = require('../model/database.js')
const {getOrSetCache, getOrSetHashCache, Jsets, Jgets, Jincr} = require('../model/redis.js')

var getCart = async (req, res, next) =>{
    try{
        var user_id = req.session.user_id
        var user = req.session.username

        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){
            var sqlQuery = {
                text: `SELECT a.cart_id, a.item_id, a.qty,b.item_name, 
                        b.rental_rate, b.image_path, b.item_description 
                        FROM "public".cart a LEFT JOIN "public".item b 
                        ON a.item_id = b.item_id WHERE account_id = $1`,
                values: [user_id]
            }
    
            const result = await pool.query(sqlQuery)
            res.render('pages/cart', { user, result:result.rows, 
                                       cart_count:req.session.cart_count, 
                                       currency:req.session.currency })
        }        
    }
    catch(ex){
        console.log(`getCart Error ${ex}`)
    }
    finally{
        pool.release
        next()
    }
}


var removeCart = async (req, res, next) =>{
    try{
        var sqlQuery = {
            text: `DELETE FROM "public".cart WHERE cart_id = $1 RETURNING item_id`,
            values: [req.params.cart_id]
        }
        const result = await pool.query(sqlQuery)        
        // console.log(result.rows[0].item_id)
        req.session.cart_count = req.session.cart_count - 1
        await Jincr(`item_perf:${result.rows[0].item_id}`, 'rm_cart')
        res.redirect('/cart')
    }
    catch(ex){
        console.log(`getCart Error ${ex}`)
    }
    finally{
        pool.release
        next()
    }
};

module.exports = {
    getCart,
    removeCart
}
