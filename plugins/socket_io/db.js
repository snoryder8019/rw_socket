const {getDb}=require('../mongo/mongo')
const { ObjectId } = require('mongodb');

const fetchLatestMessages = async (roomId, page = 1, limit = 12) => {
    try {
        const db = getDb();
        const chatMessagesCollection = db.collection("chat_messages_meta");

        const skip = (page - 1) * limit; // Calculate the number of documents to skip
const roomIdObj='660834dfe387817ec2612c78'
        // Fetch the latest 12 messages for the specified room
        const messages = await chatMessagesCollection.find({ roomId:roomIdObj })
                            .sort({ messageDate: -1 }) // Sort by messageDate in descending order
                            .skip(skip)
                            .limit(limit)
                            .toArray();
//console.log(messages)
        return messages;
    } catch (error) {
        console.error("Failed to fetch messages:", error);
        throw error; // Rethrow the error for the caller to handle
    }
};


const savechatMessage = async (userKey, displayName, roomId, messageText, avatarUrl) => {
    try {
        console.log(`/plugins/socket_io/db.js: userKey ${userKey}, displayName: ${displayName},roomId: ${roomId}`)
        const db = getDb();
        const chatMessagesCollection = db.collection("chat_messages_meta");
        const chatRoomCollection = db.collection("chat_room_meta");
        const createdAt = new Date();
const roomObj =new ObjectId(roomId)
        const newMessageDoc = {
            roomId:roomId, // Use the roomId argument dynamically
            avatarType: "standard",
            emojis: [],
            flagged: false,
            frameType: "standard",
            likes: 0,
            message: messageText,
            messageDate: createdAt,
            respondedTo: 0,
            sharedBy: [userKey], // User ID of the message sender
            user: displayName, // Display name of the user
            visible: true,
            reviewed: false,
            reviewedBy: "none",
            thumbnailUrl: avatarUrl,
        };

        await chatMessagesCollection.insertOne(newMessageDoc);

        await chatRoomCollection.updateOne(
            { _id:new ObjectId(roomId) }, // Ensure to match against an ObjectId
            {
                $set: { lastMessage: createdAt },
                $inc: { messages: 1 }
            }
        );
    } catch (error) {
        console.error(error);
        throw new Error(`Database Error: ${error}`);
    }
};

module.exports={savechatMessage, fetchLatestMessages}