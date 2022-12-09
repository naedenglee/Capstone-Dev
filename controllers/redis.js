
const { Pool } = require('pg')
const redisClient = Redis.createClient()
const Redis = require('ioredis')

pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'root',
    port: 5432,
})


function getOrSetCache (key, cb){
    return new Promise ((resolve, reject) => {
        redisClient.get(key, async (error, data)=>{
            if(error) return reject(error)
            if (data != null) return resolve(JSON.parse(data))
            const {rows} = await cb()
            redisClient.JSON.set(key, 3600, JSON.stringify(rows))
            resolve(rows)
        })
    })
}


await pool.query(`SET SCHEMA 'public'`)
const rows = await getOrSetCache(`data`, async () =>{
    const data = await pool.query('SELECT * FROM item')
    //console.log(data)
    return data
})

const rows = await getOrSetCache(`data`, async () =>{
    const data = await pool.query('SELECT * FROM item')
    //console.log(data)
    return data
})

const item_perf = await getOrSetCache(`item_perf:${req.params.id} .item_perf '`, async () =>{
    const perf = await pool.query(`SELECT * FROM item_performance WHERE item_id = ($1)`, [req.params.id])
    return perf
})
redisClient.hincrby(`item_perf:${req.params.id}`, 'detail_rate',1)

Redis.Command.setArgumentTransformer('JSON.set', 
    function (args) {
        if(args.length !=0){
            const argArray =[];
            argArray.push(args[0])
            const fieldNameValuePairs = args[1]

            for (const fieldName in fieldNameValuePairs){
                argArray.push(fieldName, fieldNameValuePairs[fieldName])
            }
            return argArray;
        }
        return args
    }
)


const item =
    {
        item_id: ,
        item_name: ,
        item_category: ,
        item_description: ,
        replacement_cost: ,
        date_posted: ,
        last_updated: ,
        image_path:
        [
            detail_rate: ,
            add_cart: ,
            rm_cart: ,
            reservations: ,
            unique_rentals: ,
            cart_to_detail_rate: ,
            rsv_to_detail_rate: ,

        ]
    }

JSON.set inventory: . '
