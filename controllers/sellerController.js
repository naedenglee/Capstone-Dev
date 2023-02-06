const {pool} = require('../model/database.js')
const cloudinary = require('cloudinary').v2

cloudinary.config({ 
    cloud_name: 'ddk9lffn7', 
    api_key: '646917413963653', 
    api_secret: 'ptjD8QM9epsZPnkBPX_mRC7JF-Y',
    secure: true 
  });

var sellerInsert = async (req, res, next)=>{

    const uploadImage = async (imagePath) => {

        // Use the uploaded file's name as the asset's public ID and 
        // allow overwriting the asset with new versions
        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            folder:'mang-hiram-seller-pictures'
        };
    
        try {
            // Upload the image
            const result = await cloudinary.uploader.upload(imagePath, options);
            console.log(result);
            return result.secure_url;
        } catch (error) {
            console.error(error);
        }
    };

    

    const imagePath = req.body.imageFileb64;

    // Upload the image
    const imageUrl = await uploadImage(imagePath);

    try{
       
        var sqlQuery = { 
            text: `CALL item_insert($1, $2, $3, $4, $5, $6, $7, $8, NULL)`,
            values: [
                req.body.item_name, //HTML
                req.body.category,
                req.body.description, 
                req.body.rental_rate, 
                req.body.replacement_cost,
                imageUrl,
                req.body.quantity,
                req.session.user_id
            ]
        }

        await pool.query(`SET SCHEMA 'public'`)
        const result = await pool.query(sqlQuery)
        let {vitem_id} = result.rows[0]

        if(vitem_id == null){ // DATABASE RETURNS vinventory_id NULL 
            return res.send('Conflict Query')
        }
        else if(vitem_id != null){ // IF ACCOUNT DOES EXIST
            res.redirect('/')
        }
    }
    catch(ex){
        console.log(`SellerInsert Error ${ex}`)
    }
    finally{
        pool.release
        next()
    }
}

var sellerItems = async(req, res, next) => {
    var user = req.session.username
    var user_id = req.session.user_id

    if(!user){
        res.status(401).render('pages/error401')
    }
    else if(user){
        await pool.query(`SET SCHEMA 'public'`)
        const {rows: sellerItems} = await pool.query(`SELECT a.item_id, item_name, item_category, item_description, rental_rate, replacement_cost, item_quantity
                                                        FROM item a JOIN inventory b ON a.item_id = b.item_id WHERE b.account_id = ($1)`, [user_id])
        if(sellerItems.length == 0){
            var sellerItemsResult = 0
        }
        else if(sellerItems[0]){
            var sellerItemsResult = sellerItems
        }


        res.render('pages/seller_items', { user:req.session.username, 
                                        user_id:req.session.user_id,
                                        cart_count:req.session.cart_count, 
                                        currency:req.session.currency, 
                                        status:req.query.loginStatus,
                                        sellerItemsResult,
                                        status:req.query.status })
    }
}

var updateItem = async(req, res, next) => {
    try{
        var user = req.session.username

        if(!user)[
            res.status(401).render('pages/error401')
        ]
        else if(user){
            var item_id = req.body.itemId
            var item_name = req.body.itemName
            var quantity = req.body.quantity
            var category = req.body.categoryModal
            var rental_rate = req.body.rentalRate
            var deposit = req.body.deposit
            var description = req.body.descriptionModal

            await pool.query(`SET SCHEMA 'public'`)
            await pool.query(`UPDATE item SET item_name = ($1), 
                            item_category = ($2), 
                            rental_rate = ($3),
                            replacement_cost = ($4),
                            item_description = ($5)
                            WHERE  item_id = ($6)`, [item_name, category, rental_rate, deposit, description, item_id])

            await pool.query(`UPDATE inventory SET item_quantity = ($1) WHERE item_id = ($2)`, [quantity, item_id])

            res.redirect('/seller/items?status=editSuccess')
        }
    }
    catch(ex){
        console.log(ex)
    }
    
}


module.exports = {
    sellerInsert, sellerItems, updateItem
}



