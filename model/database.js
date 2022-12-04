
//for postgres
//const { Client } = require('pg')
const { Pool } = require('pg')
const Redis = require('ioredis')
const redisClient = Redis.createClient()

//const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

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
            const freshData = await cb()
            redisClient.setex(key, 3600, JSON.stringify(freshData))
            resolve(freshData)
        })
    })
}



module.exports = {
    pool,
    redisClient,
    getOrSetCache
}
