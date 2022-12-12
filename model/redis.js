const {redisClient} = require('../model/database.js')


const Jsets = (id, keyPaths, input) => {
  
  return redisClient.send_command('JSON.SET', id, keyPaths, JSON.stringify(input)).then((res) => {
    return res
  }).catch((e) => {
    console.error('redis insertion error', e)
  })
}
const Jgets = (id, keyPaths, input) => {

    return redisClient.send_command('JSON.GET', id, keyPaths).then((res) => {
        return JSON.parse(res)
    }).catch((e) => {
        console.error('redis Json.get error', e)
    })
}

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
    getOrSetCache,
    getOrSetHashCache,
    Jsets,
    Jgets
}
