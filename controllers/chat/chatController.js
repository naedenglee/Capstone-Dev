
const {publisher, subscriber, Redis, redisClient, pool} = require('../../model/database.js')
const {getOrSetCache, getOrSetHashCache, Jincr} = require('../../model/redis.js')

// TO READ CHAT MESSAGES
 async function subs () {
    try{
        await subscriber.subscribe("products")
        await subscriber.on("message", async (channel, message) => {
            let perRoom
            let chatters = JSON.parse(message)
            let getRoom =  async ()=> {
                let check =  await redisClient.sismember(`chatlist:${chatters.chat.sender}`,`${chatters.roomnum}`)
                if(check== 0){
                    let check2 = await redisClient.sismember(`chatlist:${chatters.chat.sender}`,
                                            `${chatters.chat.receiver}${chatters.chat.sender}`)
                    if(check2==1){
                        return `${chatters.chat.receiver}${chatters.chat.sender}`
                    }
                    else{
                        return chatters.roomnum 
                    }
                }
                else{
                    return chatters.roomnum 
                }
            }
            getRoom().then(x =>{
                redisClient.sadd(`chatlist:${chatters.chat.receiver}`,`${x}`)
                redisClient.sadd(`chatlist:${chatters.chat.sender}`,`${x}`)
                redisClient.sadd(`room:${x}`, JSON.stringify(chatters.chat))
                return perRoom = x
            })
            await pool.query(`SET SCHEMA 'public'`)
            let {rows: getName } = await pool.query(`SELECT account_id, first_name, last_name 
                                                FROM profile 
                                                WHERE account_id = ${chatters.chat.sender} 
                                                OR account_id = ${chatters.chat.receiver}`)
            const chatAll = {
                chat_id: chatters.chat.receiver,
                name: 'Placeholder',
                room: perRoom
            }

            getName.forEach(
                function(currentValue, index){
                    if(this[index].account_id == chatters.chat.sender){
                        chatAll.name = `${currentValue.first_name} ${currentValue.last_name}`
                        redisClient.sadd(`allChat:${chatters.chat.receiver}`,JSON.stringify(chatAll))
                    }
                    else if (this[index].account_id == chatters.chat.receiver){
                        chatAll.name = `${currentValue.first_name} ${currentValue.last_name}`
                        redisClient.sadd(`allChat:${chatters.chat.sender}`,JSON.stringify(chatAll))
                    }
            }, getName)
        })
    }
    catch(ex){
        console.log(`subs Error ${ex}`)
    }
} 

const sendChat = async (req, res, next) =>{
    try{
        let user_id = req.session.user_id
        let chat_id1 = req.params.chat_id
        await subs() // listens for messages in the background

            const product ={
                roomnum: `${user_id}${chat_id1}`,
                chat: {
                    sender: user_id, // req.session.user_id
                    receiver: chat_id1, // req.params.seller_id
                    image: null,
                    //name: address table fullname
                    chatMessage: req.body.input, 
                    time: new Date().toLocaleString()
                }
            }
            await publisher.publish("products", JSON.stringify(product))
            res.redirect(`/chat/show/${chat_id1}/${user_id}${chat_id1}`)
    }
    catch(ex){
        console.log(`sendChat Error ${ex}`)
    }
}

const showMessages = async (req, res, next) =>{

    let chat_id = req.params.chat_id 
    let user_id = req.session.user_id
    let allChat = await redisClient.smembers(`allChat:${user_id}`)
    let productsers = await redisClient.smembers(`room:${req.params.room_id}`)

    productsers.forEach(function (messages, index){
            this[index] = JSON.parse(messages)
    } ,productsers)

    allChat.forEach(function (messages, index){
            this[index] = JSON.parse(messages)
    }, allChat)


    res.render('pages/chatbox', 
    { 
        user_id,
        allChat,
        messages: productsers,
        chat_id,
        room_id: req.params.room_id
    })
}
//const cloudinary = require('cloudinary').v2
//
//cloudinary.config({ 
//    cloud_name: 'ddk9lffn7', 
//    api_key: '646917413963653', 
//    api_secret: 'ptjD8QM9epsZPnkBPX_mRC7JF-Y',
//    secure: true 
//  });
//
//    const uploadImage = async (imagePath) => {
//
//        // Use the uploaded file's name as the asset's public ID and 
//        // allow overwriting the asset with new versions
//        const options = {
//            use_filename: true,
//            unique_filename: false,
//            overwrite: true,
//            folder:'mang-hiram-seller-pictures'
//        };
//    
//        try {
//            // Upload the image
//            const result = await cloudinary.uploader.upload(imagePath, options);
//            console.log(result);
//            return result.secure_url;
//        } catch (error) {
//            console.error(error);
//        }
//    };
//
//    const imagePath = req.body.imageFileb64;
//
//    // Upload the image
//    const imageUrl = await uploadImage(imagePath);

module.exports = {
    subs,
    sendChat,
    showMessages
}

