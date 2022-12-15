
const {pool, redisClient} = require('../model/database.js')
const {Jsets, Jgets} = require('../model/redis.js')

const index = async () => {
    const INDEX = 'idx:inventory'
    let indices = await redisClient.send_command('FT._LIST')
    if (indices.includes(INDEX)){
        await redisClient.call('FT.DROPINDEX', INDEX)
        console.log('Drop index')
    }
  
   await redisClient.call('FT.CREATE', INDEX,
                                'ON', 'JSON',
                                'PREFIX', 1, 'inventory:',
                                'SCHEMA',
                                '$.account_id','AS', 'account_id', 'NUMERIC',
                                '$.item_name','AS', 'item_name', 'TEXT',
                                '$.item_category','AS','item_category', 'TAG',
                                '$.item_category', 'AS', 'category', 'TEXT',
                                '$.item_description','AS','item_description', 'TEXT')
    await console.log(`Index Success`)
}

//FT.CREATE idx:inventory ON JSON SCHEMA $.account TAG SORTABLE item_name TEXT item_category TAG item_description TEXT
const CacheInventory = async() =>{

    try{
        await index()
        await pool.query(`SET SCHEMA 'public'`)
        const {rows: inventory} = await pool.query(`SELECT * FROM inventory ORDER BY item_id ASC`)
        const {rows: items} = await pool.query(`SELECT -- 
                                                a.item_id,
                                                a.account_id,
                                                a.item_quantity,
                                                b.item_name,
                                                b.item_category,
                                                b.item_description,
                                                b.rental_rate,
                                                b.replacement_cost,
                                                b.date_posted,
                                                b.image_path
                                            FROM inventory a
                                            LEFT JOIN item b 
                                                ON a.item_id = b.item_id`)
                                              
       // await inventory.forEach( async (keys)=>{
       //     let id = keys.item_id
       //     await Jsets(`inventory:${id}`, '$', keys)
       // })

        await items.forEach(async (keys)=>{
            let id = keys.item_id
            //console.log(`item:${id}`)
            await Jsets(`inventory:${id}`, '$', keys)
        })

        await console.log("cache Success")
        return
    }
    catch(ex){
        throw ex
    }
}

module.exports = {
    CacheInventory
}

//``inventory{
//    item{
//    }
//}
//SELECT * FROM inventory ORDER BY item_id ASC LIMIT 1
//SELECT * FROM item a LEFT JOIN inventory b ON a.item_id = b.item_id ORDER BY a.item_id ASC LIMIT 1;
