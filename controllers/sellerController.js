const {pool} = require('../model/database.js')

var sellerInsert = async (req, res, next)=>{

    try{
        req.session.user = 1
        var sqlQuery = { 
            text: `CALL item_insert($1, $2, $3, $4, $5, $6, $7, $8, NULL)`,
            values: [
                req.body.item_name, //HTML
                req.body.category,
                req.body.description, 
                req.body.rental_rate, 
                req.body.replacement_cost,
                req.body.image_path,
                req.body.quantity,
                req.session.user
            ]
        }

        await pool.query(`SET SCHEMA 'public'`)
        const result = await pool.query(sqlQuery)
        let {vitem_id} = result.rows[0]

        if(vitem_id == null){ // DATABASE RETURNS vinventory_id NULL 
            return res.send('Conflict Query')
        }
        else if(vitem_id != null){ // IF ACCOUNT DOES EXIST
            return res.send('Success!')
        }
    }
    catch(ex){
        console.log(`SellerInsert Error ${ex}`)
    }
    finally{
        pool.releae
        next()
    }
}

module.exports = {
    sellerInsert
}



