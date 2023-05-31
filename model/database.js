
//for postgres
const { Pool } = require('pg')
const Redis = require('ioredis');
const fs = require('fs');
require('dotenv').config()

// FOR DEVELOPING LOCALLY UNCOMMENT THIS
//const redisClient = Redis.createClient()
//pool = new Pool({
//    user: 'postgres',
//    host: 'localhost',
//    database: 'postgres',
//    password: 'root',
//    port: 5432,
//})

// COMMENT redisClient and pool IF DEVELOPING LOCALLY
const redisClient = Redis.createClient({
    host: 'redis-14177.c241.us-east-1-4.ec2.cloud.redislabs.com',
    port: 14177,
    password: 'BRnnDE9XLcV6DqGUKg8UiIQeJBKdSG4i'
});

pool = new Pool({
    connectionString:'postgres://naedenglee_user:woUfLTxRRI7NW0C6BPBJEmXECUZrLgeI@dpg-cgdgd0t269v52g7rjh8g-a.oregon-postgres.render.com/naedenglee_45im',
    ssl: {
      rejectUnauthorized: false
    }
});

const publisher = new Redis({
    host: 'redis-14177.c241.us-east-1-4.ec2.cloud.redislabs.com',
    port: 14177,
    password: 'BRnnDE9XLcV6DqGUKg8UiIQeJBKdSG4i'
});

const subscriber = new Redis({
    host: 'redis-14177.c241.us-east-1-4.ec2.cloud.redislabs.com',
    port: 14177,
    password: 'BRnnDE9XLcV6DqGUKg8UiIQeJBKdSG4i'
});


//const pool = new Pool({
//    host: process.env.DB_HOST,
//    user: process.env.DB_USER,
//    database: process.env.DB_DATABASE
//    password: process.env.DB_PW,
//    port: process.env.PORT || 5432,
//})
//


module.exports = {
    pool,
    redisClient,
    Redis,
    publisher,
    subscriber
}
