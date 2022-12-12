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
            const {rows} = await pool.query(`SELECT a.reservation_id, a.owner_id, a.inventory_id, 
                                b.item_name, reservation_start, reservation_end , 
                                DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                                quantity, a.reserve_status, mode_of_payment
                            FROM reservation a JOIN item b ON a.inventory_id = b.item_id WHERE customer_id = ($1)`, [user_id]);

            console.log(user_id)
            console.log(rows)
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
        var numDays = req.body.numDays

        if(!user){
            res.status(401).render('/pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const rows = await pool.query(`SELECT reservation_id, inventory_id
            FROM reservation WHERE (SELECT DATE_ADD(return_date, INTERVAL ($1) DAY) as return_date 
            FROM reservation WHERE reservation_id = ($2)) between reservation_date and return_date
            HAVING inventory_id = ($3);`, [numDays, reservation_id, inventory_id])

            if(rows.length){
                res.status(404).send('MAY NAKA RESERVE ULUL')
            }
            else if(rows.length == 0){
                res.send('EXTENSION REQUEST SENT!')
            }
        }        
    }
    catch(ex){

    }
    finally{
        pool.release
        next()
    }
}

const lessorOngoingRentals = async(req, res, next) => {
    try{    
        var user = req.session.username
        var user_id = req.session.userId

        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const rows = await pool.query(`SELECT a.reservation_id, customer_id, a.inventory_id, b.item_name, reservation_date, return_date, DATEDIFF(return_date, reservation_date) as days_remaining, reservation_quantity, total_amount, reservation_status 
            FROM reservation a JOIN item b ON a.inventory_id = b.item_id WHERE owner_id = ($1);`, [user_id])

            res.render('pages/dashboard/dashboard_owner_reservations_ongoing', { result:rows })            
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
        var user_id = req.session.userId
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

module.exports = { viewMainDashboard, userOngoingRentals, userOngoingRentalsExtension, lessorOngoingRentals, 
                    getRentalRequests, getDeniedRentalRequests, approveRentalRequest, denyRentalRequest }
