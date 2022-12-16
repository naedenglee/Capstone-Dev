
const {pool, redisClient} = require('../model/database.js')
const {getOrSetCache, getOrSetHashCache, Jsets, Jgets, Jincr} = require('../model/redis.js')

//availability(reservation calendar)
var allItemView = async (req, res, next)=> {
    try{
        const item_id = req.query.item_id
        await pool.query(`SET SCHEMA 'public'`)
        const rows = await getOrSetCache(`data`, async () =>{
            const data = await pool.query('SELECT * FROM item')
            if(data.rows.length == 0){
               return res.status(404).render('pages/error404')
            }
            else{
                return data
            }
        })
        //console.log(rows)
        res.render('pages/item-page', 
        { 
            result:rows, 
            user:req.session.username, 
            cart_count:req.session.cart_count, 
            currency:req.session.currency
        })
    }
    catch(ex){
        console.log(`allItemView Error ${ex}`)
    }
    finally{
        pool.release
        next()
    }
}

var categoryItemView = async(req,res,next) => {
    try{
        var category = req.params.category
        await pool.query(`SET SCHEMA 'public'`)
        const rows = await getOrSetCache(`${category}`, async () =>{
        const data = await pool.query(`SELECT * FROM item WHERE item_category = ($1)`, [category])
            if(data.rows.length == 0){
                return res.status(404).render('pages/error404')
            }
            else{
                return data
            }

        })
        //console.log(rows)
        res.render('pages/item-page', 
        { 
            result:rows, 
            user:req.session.username, 
            cart_count:req.session.cart_count, 
            currency:req.session.currency
        })
    }
    catch(ex){
        console.log(`allItemView Error ${ex}`)
    }
    finally{
        pool.release
        next()
    }
}


var viewItem = async  (req, res, next)=>{
   
    try{
        var sqlQuery = {
            text: `SELECT * FROM view_item($1)`, //item id ang hinahanap
            values:[req.params.id] 
        }

        var sqlQuery2 = {
            text: `SELECT * FROM check_available($1)`, //item id ang hanap
            values: [req.params.id]
        }

        var sqlQuery5 = {
            text: `SELECT LOWER(reservation_date) AS start_date, UPPER(reservation_date) AS end_date, item_quantity, (SELECT SUM(quantity)FROM reservation a
            LEFT JOIN inventory b ON a.inventory_id = b.inventory_id WHERE b.item_id = ($1)) as sum_quantity FROM reservation a
            LEFT JOIN inventory b ON a.inventory_id = b.inventory_id WHERE b.item_id = ($1);`,
            values: [req.params.id]
        }
        
        var sqlQuery5 = {
            text: `SELECT LOWER(reservation_date) AS start_date, UPPER(reservation_date) AS end_date, item_quantity, (SELECT SUM(quantity)FROM reservation a
            LEFT JOIN inventory b ON a.inventory_id = b.inventory_id WHERE b.item_id = ($1)) as sum_quantity FROM reservation a
            LEFT JOIN inventory b ON a.inventory_id = b.inventory_id WHERE b.item_id = ($1);`,
            values: [req.params.id]
        }

        //var sqlQuery3 = {
        //    text: `SELECT rating, comment FROM <<tablename>> WHERE item_id = $(1)`, //item id ang hanap
        //    values: [req.params.id]
        //}

        //var sqlQuery4 = {
        //    text: `SELECT * FROM get_rating($1)`, //item id ang hanap
        //    values: [req.params.id]
        //}

        //const dates = await pool.query(sqlQuery2)
        //const ratesAndComments = await pool.query(sqlQuery3)
        //const rateCount = await pool.query(sqlQuery4)
        
        //res.render('pages/view-item',
        //{   result, 
        //    user:req.session.username, 
        //    result_date:dates.rows, 
        //    cart_count:req.session.cart_count, 
        //    currency:req.session.currency,
        //    ratesAndComments,
        //    rateCount
        //})
        
        await pool.query(`SET SCHEMA 'public'`)
        //const result = await pool.query(sqlQuery)
        const results = await getOrSetCache(`view_item_id:${req.params.id}`, async () =>{
            const view = await pool.query(sqlQuery)
            return view
        })
        
        const {rows: dates} = await pool.query(sqlQuery2)
       
        const result_quantity = await pool.query(sqlQuery5)
        if(result_quantity.length == 0){
            var sum_quantity = 0
        }
        else if(result_quantity.rows[0]){
            var sum_quantity = result_quantity.rows[0].sum_quantity             
        }
        
        await Jincr(`item_perf:${req.params.id}`, 'detail_rate')
        res.render('pages/view-item',
        {   result:results, 
            user:req.session.username, 
            result_date:dates, 
            cart_count:req.session.cart_count, 
            currency:req.session.currency,
            sum_quantity,
            user_id:req.session.user_id
        })
    }
    catch(ex){
        console.log(`viewItem error ${ex}`)
    }
    finally{
        pool.release
        //next()
    }
}

//Item Reservation and Add to Cart
var itemReservation = async (req, res, next) =>{
    try{
        let user = req.session.user_id
        let item_id = req.params.id
        if(req.body.submitButton == "addToCart"){
            
            if(!user){
                res.redirect('/')
            }
            if(user){
                await pool.query(`SET SCHEMA 'public'`)
                var result = await pool.query(`SELECT item_id FROM cart WHERE account_id = ($1) AND item_id = ($2)`,[user, item_id])
                if(result.rows.length == 0){
                    //const rows = await pool.query(`INSERT INTO cart  VALUES ($1, $2, 1)`,[user, item_id])
                    const rows = await pool.query(`INSERT INTO cart (account_id, item_id, qty)VALUES ($1, $2, 1)`,[user, item_id])
                    req.session.cart_count += 1
                }
                else if(result.rows){
                    res.send('Item is already in the cart!')
                    //ADD MODULAR ITEM IS ALREADY IN CART!
                }
                
    
            
    
                await Jincr(`item_perf:${req.params.id}`, 'add_cart')
                res.redirect('/items')
            }
        }   
        else if(req.body.submitButton == "reserve"){
            if(!user){
                res.status(401).render('pages/error401')
            }
            else if(user){
                await pool.query(`SET SCHEMA 'public'`)
                const foo = await pool.query(`SELECT inventory_id, account_id FROM inventory WHERE item_id = ($1)`, [req.params.id])
                console.log(foo.rows)
                let {inventory_id, account_id} = foo.rows[0]
                console.log(inventory_id, req.session.user_id, req.body.start_date, req.body.end_date)
                var sqlQuery = {
                    text: `CALL check_reservation($1, $2, $3, $4, $5, $6 $7)`, // <-- INSERT STATEMENT STORED PROC
                    values: [inventory_id, account_id, req.body.modalQty, req.session.user_id, req.body.start_date, req.body.end_date, req.body.modeOfPayment]
                }
                const result2 = await pool.query(sqlQuery)
                let {vinventory_id} = result2.rows[0]
                

                if(vinventory_id == null){ // DATABASE RETURNS vinventory_id NULL 
                    return res.send('Item is already reserved!')
                }

                else if(vinventory_id != null){ // IF ACCOUNT DOES EXIST
                    await Jincr(`item_perf:${itemId}`, 'reservations')
                    return res.redirect(`/items`)
                }
            }            
        }
    }

    catch(ex){
        console.log(`itemReservation Error ${ex}`)
    }

    finally{
        pool.release
        next()
    }
}

var itemCalendar = (req, res, next)=> {
    var daterange = req.body.daterange
    var startDate
    var endDate
    [startDate, endDate] = daterange.split(' - ');
    console.log(`${startDate}-${endDate}`)
};

module.exports = {
    viewItem,
    allItemView,
    categoryItemView,
    itemCalendar,
    itemReservation
}
