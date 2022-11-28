
//for postgres
//const { Client } = require('pg')
const {Pool } = require('pg')

const pool = new pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });



module.exports = {
    client, pool
}
