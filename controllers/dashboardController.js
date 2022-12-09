const {pool} = require('../model/database.js')

var viewMainDashboard = async(req, res, next) => {
    try{
        if(!user){
            res.render('pages/error401')
        }    
        else if(user){
            res.render('pages/dashboard/dashboard_main')
        }
        
    }
    catch(ex){
        res.send(ex)
    }
    finally{

    }
}

var userOngoingRentals = async(req, res, next) => {
    try{    
        var user = req.session.username
        var user_id = req.session.userId

        if(!user){
            res.status(401).render('/pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const rows = await pool.query(`SELECT a.rental_id, owner_id, a.inventory_id, b.item_name, rental_date, return_date, DATEDIFF(return_date, rental_date) as days_remaining, rental_quantity, total_amount, rental_status 
            FROM reservation a JOIN item b ON a.inventory_id = b.item_id WHERE customer_id = ($1);`, [user_id])
            if(rows.length == 0){
                res.redirect('/dashboard/user/rentals/ongoing?reservation=WALA')
            }
            else if(rows){
                res.render('pages/dashboard/dashboard_user_rentals_ongoing', { result:rows })
            }
        }        
    }
    catch(ex){
        res.send(ex)
    }
    finally{

    }
}

var userOngoingRentalsExtension = async(req, res, next) => {
    try{    
        var user = req.session.username
        var user_id = req.session.userId
        var inventory_id = req.body.inventoryId
        var rental_id = req.body.orderIdExtension
        var numDays = req.body.numDays

        if(!user){
            res.status(401).render('/pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const rows = await pool.query(`SELECT rental_id, inventory_id
            FROM reserved_date_new WHERE (SELECT DATE_ADD(return_date, INTERVAL ($1) DAY) as return_date 
            FROM reserved_date_new WHERE rental_id = ($2)) between rental_date and return_date
            HAVING inventory_id = ($3);`, [numDays, rental_id, inventory_id])

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

    }
}

module.exports = { viewMainDashboard, userOngoingRentals, userOngoingRentalsExtension }