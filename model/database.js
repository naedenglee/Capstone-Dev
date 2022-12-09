
//for postgres
//const { Client } = require('pg')
const { Pool } = require('pg')
const Redis = require('ioredis')
const redisClient = Redis.createClient({
    url: process.env.REDIS_DB,
})
require('dotenv').config()

//const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });
//const connectionString = process.env.DB_CONNSTRING 
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.PORT || 5432,
    password: process.env.DB_PW,
    database: process.env.DB_DATABASE
})

//pool = new Pool({
//    user: 'postgres',
//    host: 'localhost',
//    database: 'postgres',
//    password: 'root',
//    port: 5432,
//})

Redis.Command.setArgumentTransformer('wrong', 
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

function getOrSetCache (key, cb){
    return new Promise ((resolve, reject) => {
        redisClient.get(key, async (error, data)=>{
            if(error) return reject(error)
            if (data != null) return resolve(JSON.parse(data))
            const {rows} = await cb()
            redisClient.setex(key, 3600, JSON.stringify(rows))
            resolve(rows)
        })
    })
}

function getOrSetHashCache (key, cb){
    return new Promise ((resolve, reject) => {
        redisClient.hgetall(key, async (error, data)=>{
            if(error) return reject(error)
            if (data != null) return resolve(data)
            const {rows} = await cb()
            redisClient.hset(key, rows)
            resolve(rows)
        })
    })
}




module.exports = {
    pool,
    redisClient,
    getOrSetCache,
    getOrSetHashCache,
}

