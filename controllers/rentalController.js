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
            const {rows: rental} = await pool.query(`SELECT a.reservation_id, a.owner_id, d.username as owner_username, a.customer_id, 
                (SELECT username FROM account WHERE account_id = a.customer_id) as customer_username, a.inventory_id, c.item_id,  
                c.item_name, image_path, reservation_start, reservation_end , 
                DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                quantity, a.reserve_status, mode_of_payment, (rental_rate * (reservation_end - reservation_start)) + replacement_cost as total_amount
                FROM reservation a JOIN inventory b ON b.inventory_id = a.inventory_id 
                JOIN item c ON c.item_id = b.item_id JOIN account d ON d.account_id = a.owner_id
                WHERE reservation_id = ($1) AND (owner_id = ($2) OR customer_id = ($2))`, [rental_id, user_id]);
            if(rental.length == 0){
                res.status(404).render('pages/error404')
            }
            else if(rental[0]){
                const {rows: customer_address} = await pool.query(`SELECT reservation_id, customer_id, full_name, house_number, street, barangay, district, city_prov
                                                                    FROM reservation a JOIN address b ON a.customer_id = b.account_id WHERE reservation_id = ($1);`, [rental_id])

                const {rows: owner_address} = await pool.query(`SELECT reservation_id, owner_id, full_name, house_number, street, barangay, district, city_prov
                                                                FROM reservation a JOIN address b ON a.owner_id = b.account_id WHERE reservation_id = ($1);`, [rental_id])

                res.render('pages/reservation/viewReservation', { rental, customer_address, owner_address })
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

var viewDeliveryConfirmation = async(req, res, next) => {
    try{    
        var user = req.session.username
        var user_id = req.session.user_id
        var rental_id = req.params.rental_id

        await pool.query(`SET SCHEMA 'public'`)
        const {rows: confirmation} = await pool.query(`SELECT a.reservation_id, image_url, message, courier_status, customer_id, owner_id 
                                                    FROM courier a JOIN reservation b ON a.reservation_id = b.reservation_id
                                                    WHERE a.reservation_id = ($1) ORDER BY courier_id DESC`, [rental_id])
        
        if(user_id != confirmation[0].owner_id && user_id != confirmation[0].customer_id){
            res.status(404).render('pages/error404')
        }
        else if(user_id == confirmation[0].owner_id || user_id == confirmation[0].customer_id){
            res.render('pages/reservation/viewDeliveryConfirmation', { confirmation })
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
module.exports = { viewRental, viewDeliveryConfirmation }
