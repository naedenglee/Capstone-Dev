const {pool} = require('../model/database.js')

var viewMainDashboard = async(req, res, next) => {
    try{
        var user = req.session.username
        var user_id = req.session.userId
        
        if(!user){
            res.status(401).render('pages/error401')
        }    
        else if(user){
            res.render('pages/dashboard/dashboard_main')
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

const userOngoingRentals = async(req, res, next) => {
    try{    
        var user = req.session.username
        var user_id = req.session.user_id

        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const {rows} = await pool.query(`SELECT a.reservation_id, a.owner_id, a.inventory_id, c.item_id,  
                c.item_name, image_path, reservation_start, reservation_end , 
                DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                quantity, a.reserve_status, mode_of_payment FROM reservation a JOIN inventory b ON b.inventory_id = a.inventory_id 
                JOIN item c ON c.item_id = b.item_id WHERE customer_id = ($1)`, [user_id]);
           
            res.render('pages/dashboard/dashboard_user_rentals_ongoing', { result:rows })            
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

const userOngoingRentalsExtension = async(req, res, next) => {
    try{    
        var user = req.session.username
        var user_id = req.session.userId
        var inventory_id = req.body.inventoryId
        var reservation_id = req.body.orderIdExtension
        var numDays = parseInt(req.body.numDays)

        
            await pool.query(`SET SCHEMA 'public'`)
            var  result  = await pool.query(`SELECT reservation_id, inventory_id
            FROM reservation WHERE (SELECT reservation_end + INTERVAL '1 DAY' * ${numDays} as reservation_end 
            FROM reservation WHERE reservation_id = ${reservation_id}) between reservation_start and reservation_end
            GROUP BY reservation_id HAVING inventory_id = ${inventory_id}`)

            if(result.rows.length == 0){
                var insertExtension = await pool.query(`INSERT INTO extension(account_id, inventory_id, extension_date_end) VALUES
                                        (($1), ($2), (SELECT reservation_end + INTERVAL '1 DAY' * ${numDays} as reservation_end 
                                        FROM reservation WHERE reservation_id = ${reservation_id}))`)
                res.redirect('/')
            }
            else if(result.rows){
                res.send('MAY NAKA RESERVE!')
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

const userFinishedRentals = async(req, res, next) => {
    try{
        var user = req.session.username
        var user_id = req.session.user_id

        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const {rows} = await pool.query(`SELECT a.reservation_id, a.owner_id, a.inventory_id, c.item_id,  
                c.item_name, image_path, reservation_start, reservation_end , 
                DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                quantity, a.reserve_status, mode_of_payment, rating_id FROM reservation a JOIN inventory b ON b.inventory_id = a.inventory_id 
                JOIN item c ON c.item_id = b.item_id LEFT JOIN user_rating d ON d.item_id = c.item_id 
                WHERE customer_id = ($1) and reserve_status = 5`, [user_id]);
            
            res.render('pages/dashboard/dashboard_user_rentals_finished', { result:rows })            
        }       
    }
    catch(ex){
        res.send(ex)
    }
    finally{

    }
}



const lessorOngoingRentals = async(req, res, next) => {    
    try{    
        var user = req.session.username
        var user_id = req.session.user_id

        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const {rows} = await pool.query(`SELECT a.reservation_id, a.customer_id, a.inventory_id, c.item_id,  
                c.item_name, image_path, reservation_start, reservation_end , 
                DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                quantity, a.reserve_status, mode_of_payment FROM reservation a JOIN inventory b ON b.inventory_id = a.inventory_id 
                JOIN item c ON c.item_id = b.item_id WHERE owner_id = ($1)`, [user_id]);

            console.log(user_id)
            console.log(rows)
            res.render('pages/dashboard/dashboard_owner_rentals_ongoing', { result:rows })            
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

const getRentalRequests = async(req, res, next) => {
    try{    
        var user = req.session.username
        var user_id = req.session.userId
        
        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const rows = await pool.query(`SELECT a.reservation_id, customer_id, a.inventory_id, b.item_name, reservation_date, return_date, reservation_quantity
            FROM reservation a JOIN item b ON a.inventory_id = b.item_id WHERE owner_id = ($1) AND reservation_status = 'requested';`, [user_id])

            res.render('pages/dashboard/dashboard_requests', { result:rows })            
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

const getDeniedRentalRequests = async(req, res, next) => {
    try{    
        var user = req.session.username
        var user_id = req.session.userId
        
        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const rows = await pool.query(`SELECT a.reservation_id, customer_id, a.inventory_id, b.item_name, reservation_date, return_date, reservation_quantity
            FROM reservation a JOIN item b ON a.inventory_id = b.item_id WHERE owner_id = ($1) AND reservation_status = 'denied';`, [user_id])

            res.render('pages/dashboard/dashboard_requests_denied', { result:rows })            
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

const approveRentalRequest = async(req, res, next) => {
    try{    
        var user = req.session.username
        var user_id = req.session.userId
        var reservation_id = req.body.orderId
        
        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const rows = await pool.query(`UPDATE reservation SET reservation_status = 'ongoing' WHERE reservation_id = ($1)`, [reservation_id])

            res.redirect('/dashboard/lessor/reservations/ongoing')            
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

const denyRentalRequest = async(req, res, next) => {
    try{    
        var user = req.session.username
        var user_id = req.session.user_id
        var reservation_id = req.body.orderId
        
        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const rows = await pool.query(`UPDATE reservation SET reservation_status = 'denied' WHERE reservation_id = ($1)`, [reservation_id])

            res.redirect('/dashboard/lessor/requests/denied')            
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

const update_reservation = async(req, res, next) =>{
    try{

        var reservation_id = req.body.orderId
        let val = req.body.rental_button

        await pool.query(`SET SCHEMA 'public'`)
        const reservation_check = await pool.query(`SELECT reservation_id, reserve_status FROM reservation WHERE reservation_id = ($1)`, [reservation_id])
        //console.log(reservation_check.rows)
        if(reservation_check.rows[0].reservation_id == null){
            res.send(`RESERVATION DOES NOT EXIST`)
        }
        else{
            let res_status = reservation_check.rows[0].reserve_status
            console.log(res_status)
            await pool.query(`CALL update_reservation_status($1, $2)`, [reservation_id, res_status])
            console.log(`reservation updated!`)
            res.redirect('/dashboard')
        }
    }
    catch(ex){
        res.send(`Dashboard update_reservation ERROR: ${ex}`)
    }
}

const addComment = async(req, res, next) => {
    try{
        var user = req.session.username
        var user_id = req.session.user_id
        var reservation_id = req.body.orderId
        var item_id = req.body.itemId
        var comment = req.body.comment
        var rating = req.body.rating
        
        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){                     
            await pool.query(`SET SCHEMA 'public'`)
            const setRating = await pool.query(`INSERT INTO user_rating (item_id, rating_by, rating, comment)
                                                VALUES(($1), ($2), ($3), ($4))`, [item_id, user_id, rating, comment])
            res.redirect('/dashboard/user/rentals/finished')     
        }     
    }
    catch(ex){
        console.log(ex)
    }
    finally{

    }
}


module.exports = { viewMainDashboard, userOngoingRentals, userFinishedRentals, userOngoingRentalsExtension, lessorOngoingRentals, 
                    getRentalRequests, getDeniedRentalRequests, approveRentalRequest, denyRentalRequest, update_reservation, addComment}
