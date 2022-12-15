
const {pool, redisClient} = require('../model/database.js')
const {find, Jsets, Jgets} = require('../model/redis.js')


const search_text = async (req, res, next) => {
    try{
        const search_result =  await find(`@item_name:(${req.body.searchfield})`)
        console.log(search_result)
        //render page here
    }
    catch(ex){
        console.log(ex)
    }
}

const getCategory = async (req, res, next) =>{
    try{
        const category_result =  await find(`@item_category:{${req.body.searchfield}}`)
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

//{rows: nae} = pool query

//nae.item_quantity
//FT.SEARCH idx:inventory "morbi" LIMIT 0 100
