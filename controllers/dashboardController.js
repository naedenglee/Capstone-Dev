const {Jgets, pool} = require('../model/database.js')
const {Jincr} = require('../model/redis.js')
const cloudinary = require('cloudinary').v2

cloudinary.config({ 
    cloud_name: 'ddk9lffn7', 
    api_key: '646917413963653', 
    api_secret: 'ptjD8QM9epsZPnkBPX_mRC7JF-Y',
    secure: true 
  });

var viewMainDashboard = async(req, res, next) => {
    try{
        var user = req.session.username
        var user_id = req.session.user_id
        console.log(user_id)
        
        if(!user){
            res.status(401).render('pages/error401')
        }    
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const {rows: stats} = await pool.query(`SELECT * FROM top_graph(${user_id})`)
            const {rows: notif} = await pool.query(`SELECT notification_date, owner_id,  client_id, b.username as client_username, 
                                    reserve_status, notification_type, reservation_id, a.item_id, item_name FROM notification a 
                                    JOIN account b ON a.client_id = b.account_id LEFT JOIN item c ON a.item_id = c.item_id WHERE owner_id = ($1) OR client_id = ($1)
                                    ORDER BY notification_id DESC`, [user_id])
            const {rows: summary} = await pool.query(`SELECT * FROM dashboard_summary($1)`,[user_id])
            if(notif.length == 0){
                var notif_result = 0   
                //console.log(notif_result)             
            }
            else if(notif[0]){
                var notif_result = notif
                //console.log(notif_result)  
            }
            console.log(summary[0].purchase_orders)

            res.render('pages/dashboard/dashboard_graph', 
            {
                result:stats, 
                status:req.query.status, 
                notif_result, user_id,
                summary
            })
        }
    }
    catch(ex){
        console.log(`Dashboard main Error ${ex}`)
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
                c.item_name, image_path, reservation_start, reservation_end , replacement_cost, rental_rate,
                DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                quantity, a.reserve_status, mode_of_payment, (rental_rate * (reservation_end - reservation_start) * quantity) + (quantity * replacement_cost) as total_amount
                FROM reservation a JOIN inventory b ON b.inventory_id = a.inventory_id 
                JOIN item c ON c.item_id = b.item_id WHERE customer_id = ($1) AND reserve_status IN (1,2,3,4,6,10)`, [user_id]);
           
            res.render('pages/dashboard/dashboard_user_rentals_ongoing', { result:rows, status:req.query.status })            
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

// const userOngoingRentalsExtension = async(req, res, next) => {
//     try{    
//         var user = req.session.username
//         var user_id = req.session.userId
//         var inventory_id = req.body.inventoryId
//         var reservation_id = req.body.orderIdExtension
//         var numDays = parseInt(req.body.numDays)

        
//             await pool.query(`SET SCHEMA 'public'`)
//             var  result  = await pool.query(`SELECT reservation_id, inventory_id
//             FROM reservation WHERE (SELECT reservation_end + INTERVAL '1 DAY' * ${numDays} as reservation_end 
//             FROM reservation WHERE reservation_id = ${reservation_id}) between reservation_start and reservation_end
//             GROUP BY reservation_id HAVING inventory_id = ${inventory_id}`)

//             if(result.rows.length == 0){
//                 var insertExtension = await pool.query(`UPDATE reservation SET reservation_end = (reservation_end + INTERVAL '1 DAY' * ${numDays}) 
//                                                         WHERE reservation_id = ($1);`, [reservation_id])
                
//                 res.redirect('/dashboard/user/rentals/ongoing?status=extensionSuccess')
//             }
//             else if(result.rows){
//                 res.redirect('/dashboard/user/rentals/ongoing?status=extensionFailed')
//             }
//     }
//     catch(ex){
//         res.send(ex)
//     }
//     finally{
//         pool.release
//         next()
//     }
// }

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
            const {rows} = await pool.query
                (
                    `SELECT  a.reservation_id, a.owner_id, 
                            a.inventory_id, c.item_id,  
                            c.item_name, image_path, 
                            reservation_start, reservation_end , 
                            DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                            quantity, a.reserve_status, mode_of_payment, 
                            (rental_rate * (reservation_end - reservation_start)) *a.quantity as total_amount, 
                            rating_id 
                    FROM reservation a 
                    JOIN inventory b 
                    ON b.inventory_id = a.inventory_id 
                    JOIN item c 
                    ON c.item_id = b.item_id 
                    LEFT JOIN user_rating d 
                    ON d.reservation_id = a.reservation_id
                    WHERE customer_id = ($1) AND reserve_status IN (5,7)`, 
                [user_id]);
            
            res.render('pages/dashboard/dashboard_user_rentals_finished', { result:rows, status:req.query.status })            
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
            const {rows} = await pool.query
                (`
                    SELECT  a.reservation_id, a.customer_id, 
                            a.inventory_id, c.item_id,  
                            c.item_name, image_path, 
                            reservation_start, reservation_end , 
                            replacement_cost, rental_rate,
                            DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                            quantity, a.reserve_status, mode_of_payment, 
                            (rental_rate * (reservation_end - reservation_start)* quantity) + (replacement_cost * a.quantity) as total_amount 
                    FROM reservation a 
                    JOIN inventory b 
                    ON b.inventory_id = a.inventory_id 
                    JOIN item c 
                    ON c.item_id = b.item_id 
                    WHERE owner_id = ($1) AND reserve_status IN (1,2,3,4,6,10)
                `, [user_id]);

            //console.log(user_id)
            //console.log(rows)
            res.render('pages/dashboard/dashboard_owner_rentals_ongoing', { result:rows, status:req.query.status })            
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
            const {rows} = await pool.query
                (`
                    SELECT  a.reservation_id, a.customer_id, 
                            a.inventory_id, c.item_id,  
                            c.item_name, image_path, 
                            reservation_start, reservation_end, 
                            DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                            quantity, a.reserve_status, mode_of_payment, 
                            (rental_rate * (reservation_end - reservation_start)) * quantity as total_amount, 
                            rating_id, rating 
                    FROM reservation a 
                    JOIN inventory b 
                    ON b.inventory_id = a.inventory_id 
                    JOIN item c 
                    ON c.item_id = b.item_id 
                    LEFT JOIN user_rating d 
                    ON d.reservation_id = a.reservation_id
                    WHERE owner_id = ($1) and reserve_status IN (5,7)
                `, [user_id]);
            
            res.render('pages/dashboard/dashboard_owner_rentals_finished', { result:rows, status:req.query.status })            
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
            const { rows } = await pool.query
                (`
                    SELECT  a.reservation_id, a.customer_id, 
                            a.inventory_id, c.item_id,  
                            c.item_name, image_path, reservation_start, reservation_end , 
                            DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                            quantity, a.reserve_status, mode_of_payment, online_payment, rental_rate, replacement_cost,
                            (rental_rate * (reservation_end - reservation_start)* a.quantity) + (replacement_cost * a.quantity) as total_amount 
                    FROM reservation a 
                    JOIN inventory b 
                    ON b.inventory_id = a.inventory_id 
                    JOIN item c 
                    ON c.item_id = b.item_id 
                    WHERE owner_id = ($1) AND reserve_status IS NULL
                `, [user_id])
            
            //console.log(rows)

            res.render('pages/dashboard/dashboard_requests', { result:rows, status:req.query.status })            
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
            const { rows } = await pool.query
                (`
                    SELECT  a.reservation_id, a.owner_id, 
                            a.inventory_id, c.item_id,  
                            c.item_name, image_path, 
                            reservation_start, reservation_end , 
                            DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                            quantity, a.reserve_status, mode_of_payment, rental_rate, replacement_cost,
                            (rental_rate * (reservation_end - reservation_start)* quantity) + (a.quantity * replacement_cost) as total_amount 
                    FROM reservation a 
                    JOIN inventory b 
                    ON b.inventory_id = a.inventory_id 
                    JOIN item c 
                    ON c.item_id = b.item_id 
                    WHERE customer_id = ($1) AND reserve_status IS NULL
                `, [user_id])

            res.render('pages/dashboard/dashboard_user_requests', { result:rows, status:req.query.status })            
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
const getPayment = async(req, res, next) => {
    const uploadImage = async (imagePath) => {

        // Use the uploaded file's name as the asset's public ID and 
        // allow overwriting the asset with new versions
        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            folder:'mang-hiram-gcash-pictures'
        };
    
        try {
            // Upload the image
            const result = await cloudinary.uploader.upload(imagePath, options);
            console.log(`result: ${result}`);
            return result.secure_url;
        } catch (error) {
            console.error(error);
        }
    };

    try{
        const imagePath = String(req.body.imageFileb64);
        const imageUrl = await uploadImage(imagePath)
        let reserve_id = req.body.reservation_id;
        console.log(reserve_id)
        await pool.query(`UPDATE reservation SET online_payment = ($1) WHERE reservation_id = ($2)`,[imagePath, reserve_id]) 
        res.redirect('/dashboard/user/requests')            
    }
    catch(ex){
        res.status(401).render('pages/error401')
        console.log(`ONLINE PAYMENT ERROR ${ex}`)

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
            const { rows } = await pool.query
                (`
                    SELECT  a.reservation_id, a.customer_id, 
                            a.inventory_id, c.item_id,  
                            c.item_name, image_path, 
                            reservation_start, reservation_end , 
                            DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                            quantity, a.reserve_status, mode_of_payment, 
                            (rental_rate * (reservation_end - reservation_start)* quantity) + (replacement_cost * a.quantity) as total_amount 
                    FROM reservation a 
                    JOIN inventory b 
                    ON b.inventory_id = a.inventory_id 
                    JOIN item c 
                    ON c.item_id = b.item_id 
                    WHERE owner_id = ($1) AND reserve_status = 7
                `, [user_id])

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
        //console.log(reservation_id)
        
        if(!user){
            res.status(401).render('pages/error401')
        }
        else if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const reservation_check = await pool.query(`SELECT reservation_id, reserve_status, quantity, inventory_id, owner_id, customer_id 
            FROM reservation WHERE reservation_id = ($1)`, [reservation_id])               
                let owner_id = reservation_check.rows[0].owner_id
                let client_id = reservation_check.rows[0].customer_id

            const updateRentalStatus = await pool.query(`UPDATE reservation SET reserve_status = 1 WHERE reservation_id = ($1)`, [reservation_id])

            const notif = await pool.query(`INSERT INTO notification (notification_date, owner_id, client_id, notification_type, reservation_id)
                                            VALUES(CURRENT_DATE, ($1), ($2), 2, ($3))`, [owner_id, client_id, reservation_id])

            res.redirect('/dashboard/lessor/rentals/ongoing?status=requestAccepted')            
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
            const reservation_check = await pool.query(`SELECT reservation_id, reserve_status, quantity, inventory_id, owner_id, customer_id 
            FROM reservation WHERE reservation_id = ($1)`, [reservation_id])                
                let owner_id = reservation_check.rows[0].owner_id
                let client_id = reservation_check.rows[0].customer_id

            const rows = await pool.query(`UPDATE reservation SET reserve_status = 7 WHERE reservation_id = ($1)`, [reservation_id])

            const notif = await pool.query(`INSERT INTO notification (notification_date, owner_id, client_id, notification_type, reservation_id)
            VALUES(CURRENT_DATE, ($1), ($2), 3, ($3))`, [owner_id, client_id, reservation_id])

            res.redirect('/dashboard/lessor/requests?status=requestDenied')            
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
        const reservation_check = await pool.query(`SELECT reservation_id, reserve_status, quantity, inventory_id, owner_id, customer_id 
                                                    FROM reservation WHERE reservation_id = ($1)`, [reservation_id])
        //console.log(reservation_check.rows)
        if(reservation_check.rows[0].reservation_id == null){
            res.send(`RESERVATION DOES NOT EXIST`)
        }
        else{
            let res_status = reservation_check.rows[0].reserve_status
            let res_quantity = reservation_check.rows[0].quantity
            let res_id = reservation_check.rows[0].inventory_id
            let owner_id = reservation_check.rows[0].owner_id
            let client_id = reservation_check.rows[0].customer_id
            if(res_status == 1){
                await pool.query(`UPDATE inventory SET item_quantity = item_quantity - ($1) WHERE inventory_id = ($2)`, [res_quantity, res_id])

            }
            if(res_status == 5){
                Jincr(`item_perf:${item_id}`, 'unique_rental')
                await pool.query(`UPDATE inventory SET item_quantity = item_quantity + ($1) WHERE inventory_id = ($2)`, [res_quantity, res_id])
            }
            const result = await pool.query(`CALL update_reservation_status($1, $2)`, [reservation_id, res_status])
            const notif = await pool.query(`INSERT INTO notification (notification_date, owner_id, client_id, reserve_status, notification_type, reservation_id)
                                            VALUES(CURRENT_DATE, ($1), ($2), ($3), 0, ($4))`, [owner_id, client_id, res_status + 1, reservation_id])
            console.log(`reservation updated!`)
            res.redirect('/dashboard?status=updateSuccess')
        }
    }
    catch(ex){
        res.send(`Dashboard update_reservation ERROR: ${ex}`)
    }
}

const accept_item = async(req, res, next) =>{
    try{

        var reservation_id = req.body.orderId
        let val = req.body.rental_button

        await pool.query(`SET SCHEMA 'public'`)
        const reservation_check = await pool.query(`SELECT reservation_id, reserve_status, quantity, inventory_id, owner_id, customer_id 
                                                    FROM reservation WHERE reservation_id = ($1)`, [reservation_id])
        //console.log(reservation_check.rows)
        if(reservation_check.rows[0].reservation_id == null){
            res.send(`RESERVATION DOES NOT EXIST`)
        }
        else{
            let res_status = reservation_check.rows[0].reserve_status
            let res_quantity = reservation_check.rows[0].quantity
            let res_id = reservation_check.rows[0].inventory_id
            let owner_id = reservation_check.rows[0].owner_id
            let client_id = reservation_check.rows[0].customer_id
            if(res_status == 1){
                await pool.query(`UPDATE inventory SET item_quantity = item_quantity - ($1) WHERE inventory_id = ($2)`, [res_quantity, res_id])

            }
            const result = await pool.query(`UPDATE reservation SET reserve_status = 2 WHERE reservation_id = ($1)`, [reservation_id])
            const notif = await pool.query(`INSERT INTO notification (notification_date, owner_id, client_id, reserve_status, notification_type, reservation_id)
                                            VALUES(CURRENT_DATE, ($1), ($2), ($3), 0, ($4))`, [owner_id, client_id, 2, reservation_id])
            console.log(`reservation updated!`)
            res.redirect('/dashboard?status=updateSuccess')
        }
    }
    catch(ex){
        res.send(`Dashboard update_reservation ERROR: ${ex}`)
    }
}

const reject_item = async(req, res, next) =>{
    try{

        var reservation_id = req.body.orderId
        let val = req.body.rental_button

        await pool.query(`SET SCHEMA 'public'`)
        const reservation_check = await pool.query(`SELECT reservation_id, reserve_status, quantity, inventory_id, owner_id, customer_id 
                                                    FROM reservation WHERE reservation_id = ($1)`, [reservation_id])
        //console.log(reservation_check.rows)
        if(reservation_check.rows[0].reservation_id == null){
            res.send(`RESERVATION DOES NOT EXIST`)
        }
        else{
            let res_status = reservation_check.rows[0].reserve_status
            let res_quantity = reservation_check.rows[0].quantity
            let res_id = reservation_check.rows[0].inventory_id
            let owner_id = reservation_check.rows[0].owner_id
            let client_id = reservation_check.rows[0].customer_id
            if(res_status == 1){
                await pool.query(`UPDATE inventory SET item_quantity = item_quantity - ($1) WHERE inventory_id = ($2)`, [res_quantity, res_id])

            }
            const result = await pool.query(`UPDATE reservation SET reserve_status = 6 WHERE reservation_id = ($1)`, [reservation_id])
            const notif = await pool.query(`INSERT INTO notification (notification_date, owner_id, client_id, reserve_status, notification_type, reservation_id)
                                            VALUES(CURRENT_DATE, ($1), ($2), ($3), 0, ($4))`, [owner_id, client_id, 6, reservation_id])
            console.log(`reservation updated!`)
            res.redirect('/dashboard?status=updateSuccess')
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
                                                VALUES(($1), ($2), ($3), ($4), ($5), ($6))`, [item_id, user_id, rating, comment, reservation_id, owner_id])
            res.redirect('/dashboard/user/rentals/finished?status=ratingAdded')              
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
            await pool.query(`SET SCHEMA 'public'`)
            const {rows: count} = await pool.query(`SELECT item_id FROM item_performance`)
            await count.forEach(async function (messages, index){
                    const perf = await Jgets(`item_perf:${this[index].item_id}`, '.')
                     await pool.query(`UPDATE item_performance 
                                SET detail_rate = ($2), 
                                add_cart= ($3), 
                                rm_cart= ($4), 
                                reservations= ($5), 
                                unique_rental = ($6), 
                                search_rate= ($7)
                                WHERE item_id = ($1)`
                        , await Object.values(perf))
            } ,count)
            const {rows: totals} = await pool.query(`SELECT * FROM total_reports($1)`,[user_id])
            const {rows: reports} = await pool.query(`SELECT * FROM googol_reports() WHERE account_id = ($1)`,[user_id])

            res.render('pages/dashboard/dashboard_reports',
                {
                    total:totals,
                    report: reports
                })
        }     
    }
    catch(ex){
        console.log(ex)
    }
    finally{

    }
}


const courierDeliveryPage = async(req, res, next) => {
    try{
        var rental_id = req.params.rentalId
        const result = await pool.query
            (`
                SELECT  a.reservation_id, a.customer_id,
                        (SELECT username FROM account WHERE account_id = a.customer_id) as customer_username, 
                        owner_id, (SELECT username FROM account WHERE account_id = a.owner_id) as owner_username, a.inventory_id, c.item_id,  
                        c.item_name, reservation_start, reservation_end,                
                        quantity, a.reserve_status, mode_of_payment, replacement_cost,
                        (rental_rate * (reservation_end - reservation_start)* a.quantity) + (replacement_cost * a.quantity) as total_amount ,
                        (SELECT phone_num FROM profile WHERE a.owner_id = account_id) AS owner_phone_num,
                        (SELECT phone_num FROM profile WHERE a.customer_id = account_id) AS customer_phone_num,
                        (SELECT CONCAT(house_number, ' ', street, ' ', barangay, ' ', district, ' ', city_prov)
                        FROM address
                        WHERE account_id = owner_id) AS owner_address,
                        (SELECT CONCAT(house_number, ' ', street, ' ', barangay, ' ', district, ' ', city_prov)
                        FROM address
                        WHERE account_id = customer_id) AS customer_address
                FROM reservation a 
                JOIN inventory b 
                ON b.inventory_id = a.inventory_id 
                JOIN item c 
                ON c.item_id = b.item_id
                WHERE a.reservation_id = ($1) AND reserve_status = 1
            `, [rental_id])
        if(result.rows.length == 0){
            res.status(404).render('pages/error404')
        }
        else if(result.rows){
            res.render('pages/dashboard/dashboard_courier_deliver', {result})
        }
        
    }
    catch(ex){
        console.log(ex)
    }
    finally{

    }
}

const courierReturnPage = async(req, res, next) => {
    try{
        var rental_id = req.params.rentalId
        const result = await pool.query
            (`
                SELECT  a.reservation_id, a.customer_id,
                        (SELECT username FROM account WHERE account_id = a.customer_id) as customer_username, 
                        owner_id, (SELECT username FROM account WHERE account_id = a.owner_id) as owner_username, 
                        a.inventory_id, c.item_id,  
                        c.item_name, reservation_start, reservation_end,                
                        quantity, a.reserve_status, mode_of_payment, replacement_cost,
                        (rental_rate * (reservation_end - reservation_start)* quantity) + (replacement_cost * a.quantity) as total_amount ,
                        (SELECT phone_num FROM profile WHERE a.owner_id = account_id) AS owner_phone_num,
                        (SELECT phone_num FROM profile WHERE a.customer_id = account_id) AS customer_phone_num,
                        (SELECT CONCAT(house_number, ' ', street, ' ', barangay, ' ', district, ' ', city_prov)
                        FROM address
                        WHERE account_id = owner_id) AS owner_address,
                        (SELECT CONCAT(house_number, ' ', street, ' ', barangay, ' ', district, ' ', city_prov)
                        FROM address
                        WHERE account_id = customer_id) AS customer_address
                FROM reservation a 
                JOIN inventory b 
                ON b.inventory_id = a.inventory_id 
                JOIN item c 
                ON c.item_id = b.item_id
                WHERE a.reservation_id = ($1) and reserve_status IN (3, 6)
            `, [rental_id])

        if(result.rows.length == 0){
            res.status(404).render('pages/error404')
        }
        else if(result.rows){
            res.render('pages/dashboard/dashboard_courier_return', {result})
        }
    }
    catch(ex){
        console.log(ex)
    }
    finally{

    }
}

const updateCourier = async(req, res, next) =>{
    const uploadImage = async (imagePath) => {

        // Use the uploaded file's name as the asset's public ID and 
        // allow overwriting the asset with new versions
        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            folder:'mang-hiram-courier-photos'
        };
    
        try {
            // Upload the image
            const result = await cloudinary.uploader.upload(imagePath, options);
            return result.secure_url;
        } catch (error) {
            console.error(error);
        }
    };

    try{
        await pool.query(`SET SCHEMA 'public'`)

        if(req.body.updateButton == 1){
            const imagePath = req.body.imageFileb64;

            // Upload the image
            const imageUrl = await uploadImage(imagePath);

            const reservation_check = await pool.query(`SELECT reservation_id, reserve_status, quantity, inventory_id, owner_id, customer_id 
                                                    FROM reservation WHERE reservation_id = ($1)`, [req.params.rentalId])
                let res_status = reservation_check.rows[0].reserve_status
                let owner_id = reservation_check.rows[0].owner_id
                let client_id = reservation_check.rows[0].customer_id
            
            await pool.query(`INSERT INTO courier (reservation_id, image_url, courier_status) 
                                VALUES(($1), ($2), 1)`, [req.params.rentalId, imageUrl])
            
            await pool.query(`UPDATE reservation SET reserve_status = (reserve_status + 1) WHERE reservation_id = ($1)`, [req.params.rentalId])
            await pool.query(`INSERT INTO notification (notification_date, owner_id, client_id, reserve_status, notification_type, reservation_id)
                                            VALUES(CURRENT_DATE, ($1), ($2), ($3), 0, ($4))`, [owner_id, client_id, res_status + 1, req.params.rentalId])

            res.redirect('/dashboard/courier/confirmation/success')
        }
        else if(req.body.updateButton == 2){
            const imagePath = req.body.imageFileb64;

            // Upload the image
            const imageUrl = await uploadImage(imagePath);
            
            await pool.query(`INSERT INTO courier (reservation_id, image_url, message, courier_status) 
                                VALUES(($1), ($2), ($3), 2)`, [req.params.rentalId, imageUrl, req.body.reason])            

            res.redirect('/dashboard/courier/confirmation/failed')
        }
        else if(req.body.updateButton == 3){
            const imagePath = req.body.imageFileb64;

            // Upload the image
            const imageUrl = await uploadImage(imagePath);

            const reservation_check = await pool.query(`SELECT reservation_id, reserve_status, quantity, inventory_id, owner_id, customer_id 
                                                    FROM reservation WHERE reservation_id = ($1)`, [req.params.rentalId])
                let res_status = reservation_check.rows[0].reserve_status
                let owner_id = reservation_check.rows[0].owner_id
                let client_id = reservation_check.rows[0].customer_id
            
            await pool.query(`INSERT INTO courier (reservation_id, image_url, courier_status) 
                                VALUES(($1), ($2), 1)`, [req.params.rentalId, imageUrl])
            
            await pool.query(`UPDATE reservation SET reserve_status = 10 WHERE reservation_id = ($1)`, [req.params.rentalId])
            await pool.query(`INSERT INTO notification (notification_date, owner_id, client_id, reserve_status, notification_type, reservation_id)
                                            VALUES(CURRENT_DATE, ($1), ($2), ($3), 0, ($4))`, [owner_id, client_id, 10, req.params.rentalId])

            res.redirect('/dashboard/courier/confirmation/success')
        }
    }
    catch(ex){
        console.log(ex)
    }
    finally{

    }
}



module.exports = { viewMainDashboard, userOngoingRentals, userFinishedRentals, userOngoingRentalsExtension, lessorOngoingRentals, lessorFinishedRentals, 
                    getRentalRequests, getUserRentalRequests, getDeniedRentalRequests, approveRentalRequest, denyRentalRequest, update_reservation, addComment, 
                    getReport, courierDeliveryPage, courierReturnPage, updateCourier, accept_item, reject_item, getPayment }
