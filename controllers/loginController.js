const {pool} = require('../model/database.js')
const bcrypt = require('bcryptjs')

var home = (req, res, next) =>{
    var user_id = req.session.userid

    res.render('pages/homepage', 
    { 
        user:req.session.username, 
        user_id:req.session.user_id,
        cart_count:req.session.cart_count, 
        currency:req.session.currency, 
        status:req.query.loginStatus
    })
}


var login = async (req, res, next) =>{

    try{
        var sqlQuery = {
            text: `CALL check_login($1, $2, NULL)`,
            values: [req.body.user, req.body.pass]
        }

        await pool.query(`SET SCHEMA 'public'`)
        const result = await pool.query(sqlQuery)
        let {vid} = result.rows[0]

        if(vid == null){ // DATABASE RETURNS vid NULL 
            return res.send('ACCOUNT DOES NOT EXIST');
        }

        else if(vid != null){ // IF ACCOUNT DOES EXIST
            let {vpassword} = result.rows[0]
            validPass = bcrypt.compareSync(req.body.pass, vpassword) 
            if(!validPass){
                res.redirect('/?loginStatus=authenticationError')
                //refresh password forms
            }
            else{
                req.session.username = req.body.user;
                // var user = req.session.username
                let cartQuery = {
                    text: `SELECT 1 FROM cart WHERE account_id = $1`,
                    values: [vid] 
                }

                let currencyQuery = {
                    text: `SELECT user_currency FROM account_currency WHERE account_id = $1`,
                    values: [vid]
                }

                const result2 = await pool.query(cartQuery)
                req.session.cart_count = result2.rows.length

                const result3 = await pool.query(currencyQuery)
                        currency = req.session.currency
                        req.session.currency = result3.rows[0].user_currency
                        req.session.user_id = vid
            }
        }
    }
    catch(ex){
        console.log(`Login Error ${ex}`)
    }
    finally{
        pool.release
        res.redirect('/')
        next()
    }
}

var signup = async(req, res, next) =>{
    try{
        if(req.body.password != req.body.password2){
            console.log("WRONG PASSWORD")
            return res.send({
                success: false,
                statusCode: 400
            })
        }
        else{
            var salt = bcrypt.genSaltSync(10);
            var hashed_password = bcrypt.hashSync(req.body.password, salt);

            let sqlQuery ={
                text: `CALL register($1,$2,$3,$4,$5,$6,$7,$8, $9, $10, $11, $12, null)`,
                values: [
                        req.body.username, hashed_password, // 1 2 
                        req.body.email, req.body.fname, // 3 4 
                        req.body.lname, null, // 5 6
                        req.body.phone_num, req.body.housmumber,// 7 8
                        req.body.street, req.body.barangay, // 9 10
                        req.body.district, req.body.city_prov // 11 12
                        ]
            }

            await pool.query(`SET SCHEMA 'public'`)
            const result = await pool.query(sqlQuery)
            let {vaccount_id} = result.rows[0]
            if(vaccount_id != null){ // IF NOT NULL THEN SUCCESS
                return res.redirect('/?loginStatus=signupSuccess')
            }
            else{
                return res.send({
                    success: 'ACCOUNT EXISTS',
                    statusCode: 200,
                })
            }
        }
    }
    catch(ex){
        console.log(`Signup Error ${ex}`)
        return res.send({
            success: false,
            statusCode: 400
        })
    }
    finally{
        pool.release
        next()
    }
}

module.exports = {
    login,
    signup,
    home
}
