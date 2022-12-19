const {pool} = require('../model/database.js')
const {Jincr} = require('../model/redis.js')

var viewMainDashboard = async(req, res, next) => {
    try{
        var user = req.session.username
        var user_id = req.session.userId
        
        if(!user){
            res.status(401).render('pages/error401')
        }    
        else if(user){
            res.render('pages/dashboard/dashboard_graph')
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
                quantity, a.reserve_status, mode_of_payment, (rental_rate * (reservation_end - reservation_start)) + replacement_cost as total_amount
                FROM reservation a JOIN inventory b ON b.inventory_id = a.inventory_id 
                JOIN item c ON c.item_id = b.item_id WHERE customer_id = ($1) AND reserve_status IN (1,2,3,4)`, [user_id]);
           
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
                var insertExtension = await pool.query(`UPDATE reservation SET reservation_end = (reservation_end + INTERVAL '1 DAY' * ${numDays}) 
                                                        WHERE reservation_id = ($1);`, [reservation_id])
                
                res.redirect('/dashboard/user/rentals/ongoing')
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
                quantity, a.reserve_status, mode_of_payment, (rental_rate * (reservation_end - reservation_start)) + replacement_cost as total_amount, 
                rating_id FROM reservation a JOIN inventory b ON b.inventory_id = a.inventory_id 
                JOIN item c ON c.item_id = b.item_id LEFT JOIN user_rating d ON d.reservation_id = a.reservation_id
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
                quantity, a.reserve_status, mode_of_payment, (rental_rate * (reservation_end - reservation_start)) + replacement_cost as total_amount FROM reservation a JOIN inventory b ON b.inventory_id = a.inventory_id 
                JOIN item c ON c.item_id = b.item_id WHERE owner_id = ($1) AND reserve_status IN (1,2,3,4)`, [user_id]);

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

const lessorFinishedRentals = async(req, res, next) => {
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
                quantity, a.reserve_status, mode_of_payment, (rental_rate * (reservation_end - reservation_start)) + replacement_cost as total_amount, 
                rating_id, rating FROM reservation a JOIN inventory b ON b.inventory_id = a.inventory_id 
                JOIN item c ON c.item_id = b.item_id LEFT JOIN user_rating d ON d.reservation_id = a.reservation_id
                WHERE owner_id = ($1) and reserve_status = 5`, [user_id]);
            
            res.render('pages/dashboard/dashboard_owner_rentals_finished', { result:rows })            
        }       
    }
    catch(ex){
        res.send(ex)
    }
    finally{

    }
}

const getRentalRequests = async(req, res, next) => {
    try{    
        var user = req.session.username
        var user_id = req.session.user_id
        
        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const { rows } = await pool.query(`SELECT a.reservation_id, a.customer_id, a.inventory_id, c.item_id,  
                c.item_name, image_path, reservation_start, reservation_end , 
                DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                quantity, a.reserve_status, mode_of_payment, (rental_rate * (reservation_end - reservation_start)) + replacement_cost as total_amount 
                FROM reservation a JOIN inventory b ON b.inventory_id = a.inventory_id 
                JOIN item c ON c.item_id = b.item_id WHERE owner_id = ($1) AND reserve_status is null`, [user_id])
            
            console.log(rows)

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

const getUserRentalRequests = async(req, res, next) => {
    try{    
        var user = req.session.username
        var user_id = req.session.user_id
        
        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const { rows } = await pool.query(`SELECT a.reservation_id, a.owner_id, a.inventory_id, c.item_id,  
                c.item_name, image_path, reservation_start, reservation_end , 
                DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                quantity, a.reserve_status, mode_of_payment, (rental_rate * (reservation_end - reservation_start)) + replacement_cost as total_amount 
                FROM reservation a JOIN inventory b ON b.inventory_id = a.inventory_id 
                JOIN item c ON c.item_id = b.item_id WHERE customer_id = ($1) AND reserve_status is null`, [user_id])
            
            console.log(rows)

            res.render('pages/dashboard/dashboard_user_requests', { result:rows })            
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
        var user_id = req.session.user_id
        
        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const { rows } = await pool.query(`SELECT a.reservation_id, a.customer_id, a.inventory_id, c.item_id,  
                c.item_name, image_path, reservation_start, reservation_end , 
                DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                quantity, a.reserve_status, mode_of_payment, (rental_rate * (reservation_end - reservation_start)) + replacement_cost as total_amount 
                FROM reservation a JOIN inventory b ON b.inventory_id = a.inventory_id 
                JOIN item c ON c.item_id = b.item_id WHERE owner_id = ($1) AND reserve_status = 7`, [user_id])

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
        var user_id = req.session.user_id
        var reservation_id = req.body.orderId
        console.log(reservation_id)
        
        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const updateRentalStatus = await pool.query(`UPDATE reservation SET reserve_status = 1 WHERE reservation_id = ($1)`, [reservation_id])

            res.redirect('/dashboard/lessor/rentals/ongoing')            
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
            const rows = await pool.query(`UPDATE reservation SET reserve_status = 7 WHERE reservation_id = ($1)`, [reservation_id])

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

// const update_reservation = async(req, res, next) =>{
//     try{

//         var reservation_id = req.body.orderId
//         let val = req.body.rental_button

//         await pool.query(`SET SCHEMA 'public'`)
//         const reservation_check = await pool.query(`SELECT reservation_id, reserve_status FROM reservation WHERE reservation_id = ($1)`, [reservation_id])
//         //console.log(reservation_check.rows)
//         if(reservation_check.rows[0].reservation_id == null){
//             res.send(`RESERVATION DOES NOT EXIST`)
//         }
//         else{
//             let res_status = reservation_check.rows[0].reserve_status
//             console.log(res_status)
//             const result = await pool.query(`CALL update_reservation_status($1, $2)`, [reservation_id, res_status])
//             if(res_status = 5){
//                 Jincr(`item_perf:${item_id}`, 'unique_rental')
//             }
//             console.log(`reservation updated!`)
//             res.redirect('/dashboard')
//         }
//     }
//     catch(ex){
//         res.send(`Dashboard update_reservation ERROR: ${ex}`)
//     }
// }

const update_reservation = async(req, res, next) =>{
    try{

        var reservation_id = req.body.orderId
        let val = req.body.rental_button

        await pool.query(`SET SCHEMA 'public'`)
        const reservation_check = await pool.query(`SELECT reservation_id, reserve_status, quantity, inventory_id FROM reservation WHERE reservation_id = ($1)`, [reservation_id])
        //console.log(reservation_check.rows)
        if(reservation_check.rows[0].reservation_id == null){
            res.send(`RESERVATION DOES NOT EXIST`)
        }
        else{
            let res_status = reservation_check.rows[0].reserve_status
            let res_quantity = reservation_check.rows[0].quantity
            let res_id = reservation_check.rows[0].inventory_id
            console.log(res_status)
            if(res_status == 1){
                await pool.query(`UPDATE inventory SET item_quantity = item_quantity - ($1) WHERE inventory_id = ($2)`, [res_quantity, res_id])

            }
            if(res_status == 5){
                Jincr(`item_perf:${item_id}`, 'unique_rental')
                await pool.query(`UPDATE inventory SET item_quantity = item_quantity + ($1) WHERE inventory_id = ($2)`, [res_quantity, res_id])
            }
            const result = await pool.query(`CALL update_reservation_status($1, $2)`, [reservation_id, res_status])
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
        var reservation_id = req.body.reservationId
        var item_id = req.body.itemId
        var comment = req.body.comment
        var rating = req.body.rating
        var owner_id = req.body.ownerId
        
        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){                     
            await pool.query(`SET SCHEMA 'public'`)
            const setRating = await pool.query(`INSERT INTO user_rating (item_id, rating_by, rating, comment, reservation_id, rating_to)
                                                VALUES(($1), ($2), ($3), ($4), ($5))`, [item_id, user_id, rating, comment, reservation_id, owner_id])
            res.redirect('/dashboard/user/rentals/finished')     
        }     
    }
    catch(ex){
        console.log(ex)
    }
    finally{

    }
}

const getReport = async(req, res, next) => {
    try{
        var user = req.session.username
        var user_id = req.session.user_id
        
        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){                     
            res.render('pages/dashboard/dashboard_reports')
        }     
    }
    catch(ex){
        console.log(ex)
    }
    finally{

    }
}


module.exports = { viewMainDashboard, userOngoingRentals, userFinishedRentals, userOngoingRentalsExtension, lessorOngoingRentals, lessorFinishedRentals, 
                    getRentalRequests, getUserRentalRequests, getDeniedRentalRequests, approveRentalRequest, denyRentalRequest, update_reservation, addComment, getReport}
