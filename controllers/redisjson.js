const {redisClient} = require('../model/database.js')

class ItemsData {
    async init(){
        let indices = await this.connection.call('FT._LIST')
        if (indices.includes(INDEX)){
            await this.connection.call('FT.DROPINDEX', INDEX)
        }
    }
}

