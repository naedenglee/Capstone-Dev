const {pool, redisClient} = require('../model/database.js')
const {find, Jsets, Jincr, item_performance} = require('../model/redis.js')

const search_text = async (req, res, next) => {
    try{
        const search_result =  await find(`@item_name:(${req.body.searchfield})`)
        //let {results: []}
        let test =[]
        let item_id_perf=[]
        for(i=2; i < search_result.length;  i+=2){
            //console.log(search_result[i][1])
            test.push(JSON.parse(search_result[i][1]))
            let {item_id} = JSON.parse(search_result[i][1])
            Jincr(`item_perf:${item_id}`, 'search_rate')
            console.log(item_id)
        }
        //item_performance()



        res.render('pages/item-page', 
        { 
            result:test, 
            user:req.session.username, 
            cart_count:req.session.cart_count, 
            currency:req.session.currency,
            user_id:req.session.user_id
        })
    }
    catch(ex){
        console.log(ex)
    }
}

const getCategory = async (req, res, next) =>{
    try{
        const category_result =  await find(`@item_category:(${req.body.searchfield})`)
        console.log(category_result)
        //render page here
        //console.log(category_result)
    }
    catch(ex){
        console.log(`getCategory ERROR ${ex}`)
    }
}

const sellerItemList = async(req, rest, next) =>{
    try{
        const sellerList =  await find(`@account_id:([${req.body.searchfield}]`)
        console.log(sellerList)
    }
    catch(ex){
        console.log(`sellerItemList ERROR ${ex}`)
    }
}

module.exports ={
    search_text,
    getCategory,
    sellerItemList
}