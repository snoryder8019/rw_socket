import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../plugins/mongo/mongo.js';
import ChatMessage from '../../../plugins/mongo/models/ChatMessage.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
router.use('/', async (req, res, next) => {
  console.log(`hit users chat`);

  next();
});
const likePost = async (req, res) => {
  console.log(`initiate likes`);
  const postId = req.body.postId;
  const tally = req.body.tally;
  const userId = req.body.userId;

  try {
    console.log(postId, tally, userId);
    // Fetch the chat message by postId
    const postIdObj = new ObjectId(postId);
    //   const db =getDb();
    //    const collection = db.collection('chat_messages_meta')
    //  const response = await collection.findOne({"_id":postIdObj})
    const chatMessage = await new ChatMessage().getById(postIdObj);
    //  console.log(response)
    console.log(chatMessage);
    if (!chatMessage) {
      return res.status(404).json({ error: 'Chat message not found' });
    }

    // Update the like tally
    if (tally === '++') {
      let result = (chatMessage.likes += 1);
      let response = await new ChatMessage().updateById(postIdObj, result);
      console.log(response);
    } else if (tally === '--') {
      let result = { likes: (chatMessage.likes -= 1) };
      let response = await new ChatMessage().updateById(postIdObj, result);
      console.log(response);
    } else {
      return res.status(400).json({ error: 'Invalid tally operator' });
    }

    // Save the updated chat message

    // Return the updated tally
    res.json({ tally: chatMessage.likes });
  } catch (error) {
    console.error('Error updating like tally:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while updating the like tally' });
  }
};
router.post('/like', likePost);
buildRoutes(new ChatMessage(), router);

export default router;
