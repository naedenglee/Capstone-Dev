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




module.exports = {
    sellerInsert
}



