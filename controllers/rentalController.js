const {pool} = require('../model/database.js')

var viewRental = async(req, res, next) => {
    try{    
        var user = req.session.username
        var user_id = req.session.user_id
        var rental_id = req.params.rental_id

        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const {rows} = await pool.query(`SELECT a.reservation_id, a.owner_id, a.customer_id, a.inventory_id, c.item_id,  
                c.item_name, image_path, reservation_start, reservation_end , 
                DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                quantity, a.reserve_status, mode_of_payment FROM reservation a JOIN inventory b ON b.inventory_id = a.inventory_id 
                JOIN item c ON c.item_id = b.item_id WHERE reservation_id = ($1) AND (owner_id = ($2) OR customer_id = ($2))`, [rental_id, user_id]);
            if(rows.length == 0){
                res.status(404).render('pages/error404')
            }
            else if(rows){
                res.render('pages/reservation/viewReservation', { result:rows })
            }
                        
        }        
    }
    catch(ex){
        res.send(ex)
    }
    finally{
        pool.release
        next()
    }
}

module.exports = { viewRental }
