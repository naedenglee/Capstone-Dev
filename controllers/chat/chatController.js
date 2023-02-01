
const {publisher, subscriber, Redis, redisClient, pool} = require('../../model/database.js')
const {getOrSetCache, getOrSetHashCache, Jincr} = require('../../model/redis.js')

var checkRoom = async (req, res, next)=> {
        let chat_id = req.params.chat_id 
        let user_id = req.session.user_id
        let roomnum = req.params.room_id

        if(chat_id != null || chat_id != ""){
            let check =  await redisClient.sismember(`chatlist:${user_id}`,`${roomnum}`)
            if(check== 0){
                let check2 = await redisClient.sismember(`chatlist:${user_id}`,
                                        `${chat_id1}${user_id}`)
                if(check2==1){
                    return res.redirect(`/chat/show/${chat_id1}/${chat_id1}${user_id}`)
                }
            }
            else{
                return res.redirect(`/chat/show/${chat_id1}/${roomnum}`)
            }
        }
}

var showRoom = async (req, res, next)=> {

    try{
        let chat_id = req.params.chat_id 
        let user_id = req.session.user_id
        let roomnum = req.params.room_id

        let allChat = await redisClient.smembers(`allChat:${user_id}`)
        let productsers = await redisClient.smembers(`room:${roomnum}`)
        let getRoom = await redisClient.smembers(`chatlist:${user_id}`)
        
        getRoom.forEach(function (messages, index){
                this[index] = JSON.parse(messages)
        } ,getRoom)

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
            getRoom,
            room_id: req.params.room_id
        })

    }

    catch(ex){
        console.log(`showMessages Error ${ex}`)
    }
}

var chatRoom = async (req, res, next)=> {
    try{
        let user_id = req.session.user_id
        let chat_id1 = req.params.chat_id
        let x = req.params.room_id

        const chatters ={
            roomnum : req.params.room_id,
            chat: {
                sender: user_id, // req.session.user_id
                receiver: chat_id1, // req.params.seller_id
                image: null,
                //name: address table fullname
                chatMessage: req.body.input, 
                time: new Date().toLocaleString()
            }
        }

        await redisClient.sadd(`chatlist:${chat_id1}`,`${x}`)
        await redisClient.sadd(`chatlist:${user_id}`,`${x}`)
        await redisClient.sadd(`room:${x}`, JSON.stringify(chatters.chat))

    await pool.query(`SET SCHEMA 'public'`)
    let {rows: getName } = await pool.query(`SELECT account_id, first_name, last_name 
                                        FROM profile 
                                        WHERE account_id = ${chatters.chat.sender} 
                                        OR account_id = ${chatters.chat.receiver}`)
    const chatAll = {
        chat_id: 1,
        name: 'Placeholder',
        room: x
    }

    getName.forEach(
        function(currentValue, index){
            console.log(this[index].account_id)
            if(this[index].account_id == chatters.chat.sender){ // account_id = sender, receiver Chatall
                chatAll.chat_id = parseInt(chatters.chat.sender)
                chatAll.name = `${currentValue.first_name} ${currentValue.last_name}`
                console.log(chatAll.name)
                console.log(chatAll.chat_id)
                console.log(chatAll)
                redisClient.sadd(`allChat:${chatters.chat.receiver}`,JSON.stringify(chatAll))
            }
            else if (this[index].account_id == chatters.chat.receiver){ //account_id == receiver, sender Chatall
                chatAll.chat_id = parseInt(chatters.chat.receiver)
                chatAll.name = `${currentValue.first_name} ${currentValue.last_name}`
                console.log(chatAll.name)
                console.log(chatAll.chat_id)
                console.log(chatAll)
                redisClient.sadd(`allChat:${chatters.chat.sender}`,JSON.stringify(chatAll))
            }
    }, getName)
        res.redirect(`/chat/show/${chat_id1}/${x}`)
    }
    catch(ex){
        console.log(`chatRoom error ${ex}`)
    }
}

module.exports = {
    showRoom,
    checkRoom,
    chatRoom
}
