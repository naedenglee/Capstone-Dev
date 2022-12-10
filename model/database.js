
//for postgres
//const { Client } = require('pg')
const { Pool } = require('pg')
const Redis = require('ioredis');
//const redisClient = Redis.createClient()

//pool = new Pool({
//    user: 'postgres',
//    host: 'localhost',
//    database: 'postgres',
//    password: 'root',
//    port: 5432,
//})

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.PORT || 5432,
    password: process.env.DB_PW,
    database: process.env.DB_DATABASE
})

const fs = require('fs');
const redisClient = Redis.createClient({
    host: 'redis-14177.c241.us-east-1-4.ec2.cloud.redislabs.com',
    port: 14177,
    password: 'BRnnDE9XLcV6DqGUKg8UiIQeJBKdSG4i'
})

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
            const rows = await cb()
            redisClient.hset([key, rows])
            resolve(rows)
        })
    })
}



module.exports = {
    pool,
    redisClient,
    getOrSetCache,
    getOrSetHashCache
}
