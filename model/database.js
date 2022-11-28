
//for postgres
//const { Client } = require('pg')
const { Client, Pool } = require('pg')

//const client = new Client({
//    connectionString: process.env.DATABASE_URL,
//    ssl: {
//      rejectUnauthorized: false
//    }
//  });
//
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'root',
    port: 5432,

});

pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'root',
    port: 5432,
})


module.exports = {
    client, pool
}
