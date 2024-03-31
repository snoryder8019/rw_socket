var express = require('express');
var router = express.Router();
const path = require('path')
const { getDb } = require('../../plugins/mongo/mongo');
const { ObjectId } = require('mongodb');
const config = require('../../config/config'); // Import config if you're using it
const lib = require('../logFunctions/logFunctions')
const getNotifications = async (req, res) => {
    try {
        // Assuming req.user.notifications contains an array of notification IDs
        // And these IDs are to be found in the notifications_user collection
        const db = await getDb();
        const userId = req.user._id; // Make sure you have the user ID available in req.user
const idObj=new ObjectId(userId)
        console.log(`user: ${userId} `)
        const user = await db.collection('users').findOne({ _id:idObj });
        if (!user || !user.notifications) {
            return res.status(404).json({ message: 'User or notifications not found' });
        }

        // Convert string IDs from the user.notifications array to ObjectId
        const notificationObjectIds = user.notifications.map(id =>new ObjectId(id));

        const notifications = await db.collection('notifications_user').find({
            _id: { $in: notificationObjectIds }
        }).toArray();

        res.json(notifications);
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports={getNotifications}
