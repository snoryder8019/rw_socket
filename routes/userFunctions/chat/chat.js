const express = require('express');
const { ObjectId } = require('mongodb');
const ChatMessage = require('../../../plugins/mongo/models/ChatMessage')
const router = express.Router();
router.post('/like/:tally', async (req, res) => {
    const postId = req.body.postId;
    const tally = req.params.tally;
    const userId = req.body.userId;

    try {
        console.log(postId)
        // Fetch the chat message by postId
      //  const postIdObj = new ObjectId(postId)
        const chatMessage = await new ChatMessage().getById(postId);
       console.log(chatMessage)
        if (!chatMessage) {
            return res.status(404).json({ error: 'Chat message not found' });
        }

        // Update the like tally
        if (tally === '++') {
            chatMessage.likes += 1;
        } else if (tally === '--') {
            chatMessage.likes -= 1;
        } else {
            return res.status(400).json({ error: 'Invalid tally operator' });
        }

        // Save the updated chat message
        await chatMessage.save();

        // Return the updated tally
        res.json({ tally: chatMessage.likes });
    } catch (error) {
        console.error('Error updating like tally:', error);
        res.status(500).json({ error: 'An error occurred while updating the like tally' });
    }
});
module.exports=router