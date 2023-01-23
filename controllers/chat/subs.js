const Redis = require('ioredis');
const fs = require('fs');
const redisClient = Redis.createClient()

const express = require("express")

const port = process.env.PORT || 9000
const app = express()
const subscriber = redisClient
const products = []

subscriber.on("message", (channel, message) = {
    products.push(JSON.parse(message))
})


app.listen(port, () => {
    console.log(`app is listening on http://localhost:${port}` );
});
