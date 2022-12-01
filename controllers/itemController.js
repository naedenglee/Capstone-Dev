
const {pool} = require('../model/database.js')

//availability(reservation calendar)
var allItemView = async (req, res, next)=> {
    try{
        await pool.query(`SET SCHEMA 'public'`)
        const rows = await pool.query('SELECT * FROM item')
        res.render('pages/item-page', 
        { 
            result:rows.rows, 
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

var addCart = async (req, res, next)=> {
    try{
        let user = req.session.user_id
        let item_id= req.body.itemId
        message = 0
        if(!user){
            res.redirect('/')
        }
        if(user){
            await pool.query(`SET SCHEMA 'public'`)
            const rows = await pool.query(`SELECT item_id FROM cart WHERE account_id = ($1) AND item_id = ($2)`,[user, item_id])
            if(rows.rows.length){
                console.log('Item is already in the cart!')
                //ADD MODULAR ITEM IS ALREADY IN CART!
            }
            else if(rows.length == 0 || rows.length == null){
                //const rows = await pool.query(`INSERT INTO cart  VALUES ($1, $2, 1)`,[user, item_id])
                const rows = await pool.query(`INSERT INTO cart (account_id, item_id, qty)VALUES ($1, $2, 1)`,[user, item_id])
                req.session.cart_count += 1
            }

            res.redirect('/items')
        }
    }
    catch(ex){
        console.log(`addCart Select query error ${ex}`)
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

        var sqlQuery3 = {
            text: `SELECT rating, comment FROM <<tablename>> WHERE item_id = $(1)`, //item id ang hanap
            values: [req.params.id]
        }

        var sqlQuery4 = {
            text: `SELECT * FROM get_rating($1)`, //item id ang hanap
            values: [req.params.id]
        }

        await pool.query(`SET SCHEMA 'public'`)
        const result = await pool.query(sqlQuery)

        let {
                item_id, account_id, item_quantity, 
                item_name, item_category, item_description, 
                rental_rate, replacement, cost, date_posted, image_path
            } = result.rows[0]

        const dates = await pool.query(sqlQuery2)
        const ratesAndComments = await pool.query(sqlQuery3)
        const rateCount = await pool.query(sqlQuery4)

        res.render('pages/view-item',
        {   result, 
            user:req.session.username, 
            result_date:dates.rows, 
            cart_count:req.session.cart_count, 
            currency:req.session.currency,
            ratesAndComments,
            rateCount
        })
    }
    catch(ex){
        console.log(`viewItem error ${ex}`)
    }
    finally{
        pool.release
        next()
    }
}

var itemReservation = async (req, res, next) =>{

    try{
        pool.query(`SET SCHEMA 'public'`)
        const result = await pool.query(`SELECT inventory_id FROM inventory WHERE item_id = ($1)`, [req.params.id])
        let {inventory_id} = result.rows[0]
        var sqlQuery = {
            text: `CALL check_reservation($1, $2, $3, $4)`, // <-- INSERT STATEMENT STORED PROC
            values: [inventory_id, req.session.user_id, req.body.start_date, req.body.end_date]
        }
        const result2 = await pool.query(sqlQuery)
        let {vinventory_id} = result2.rows[0]

        if(vinventory_id == null){ // DATABASE RETURNS vinventory_id NULL 
            return res.send('Item is already reserved!')
        }

        else if(vinventory_id != null){ // IF ACCOUNT DOES EXIST
            return res.redirect(`/items`)
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
    addCart,
    itemCalendar,
    itemReservation
}
