const { getDb } = require('../mongo');
const { ObjectId } = require('mongodb');
const sendConnectionMeta = async(req,res)=>{
    try{
       const {connectionType, user} = req.params
const db = getDb();
const collection= db.collection('chat_rooms_meta')
const todaysChat = Date().split(' ');
const nowStamp =  Date.now().toLocaleString()
const todaysChatDate = todaysChat[1]+" "+todaysChat[2]+" "+todaysChat[3];
console.log(`todaysChat: ${todaysChatDate} now stamp: ${nowStamp}`)
const response = await collection.findOne({"date":todaysChatDate})
}
catch(error){console.error(error)}
}



module.exports  = {sendConnectionMeta}