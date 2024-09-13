import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../plugins/mongo/mongo.js';
import ChatMessage from '../../../plugins/mongo/models/ChatMessage.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import User from '../../../plugins/mongo/models/User.js'
const router = express.Router();
router.use('/', async (req, res, next) => {
  console.log(`hit users chat`);

  next();
});
const likePost = async (req, res) => {
  console.log(`Initiate like or unlike action`);
  const postId = req.body.postId;
  const userId = req.body.userId;
  const tally = req.body.tally;  // '++' or '--'

  try {
    const postIdObj = new ObjectId(postId);
    const chatMessage = await new ChatMessage().getById(postIdObj);

    if (!chatMessage) {
      return res.status(404).json({ error: 'Chat message not found' });
    }

    let likedBy = chatMessage.likedBy || [];  // Ensure `likedBy` is an array

    // Handle like/unlike by adding or removing the user ID from `likedBy`
    if (tally === '++') {
      if (!likedBy.includes(userId)) {
        likedBy.push(userId);  // Add the user to the likedBy array
        chatMessage.likes += 1;  // Increment likes
      }
    } else if (tally === '--') {
      likedBy = likedBy.filter(id => id !== userId);  // Remove the user from likedBy
      chatMessage.likes = Math.max(chatMessage.likes - 1, 0);  // Decrement likes but ensure it doesn't go below 0
    } else {
      return res.status(400).json({ error: 'Invalid tally operator' });
    }

    // Update MongoDB with the new `likes` count and updated `likedBy` array
    const result = { likes: chatMessage.likes, likedBy: likedBy };

    await new ChatMessage().updateById(postIdObj, result);

    res.json({ likes: chatMessage.likes });
  } catch (error) {
    console.error('Error updating like tally:', error);
    res.status(500).json({ error: 'An error occurred while updating the like tally' });
  }
};

// Fetch user's avatar
const getUserAvatar = async (userId) => {
  const user = await new User().getById(userId);
  if (!user || !user.images || !Array.isArray(user.images)) {
    return '/path/to/default/avatar.jpg';  // Default avatar
  }
  const avatarImage = user.images.find(img => img.avatarTag === true);
  return avatarImage ? avatarImage.url : '/path/to/default/avatar.jpg';
};

// Reply post logic, callable from both routes and socket

const replyPost = async (req, res) => {
  const { postId, userId, replyMessage } = req.body;

  if (!replyMessage || !postId || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const postIdObj = new ObjectId(postId);
    const chatMessage = await new ChatMessage().getById(postIdObj);

    if (!chatMessage) {
      return res.status(404).json({ error: 'Chat message not found' });
    }

    // Fetch the user's avatar URL using the getUserAvatar function
    const avatarUrl = await getUserAvatar(userId);

    // Create the reply object
    const reply = {
      userId,
      message: replyMessage,
      date: new Date(),
      thumbnailUrl: avatarUrl,  // Use the avatar URL fetched from user
    };

    // Add the new reply to the `replies` array
    chatMessage.replies = chatMessage.replies || [];  // Ensure replies array exists
    chatMessage.replies.push(reply);

    // Update the message in MongoDB
    await new ChatMessage().updateById(postIdObj, { replies: chatMessage.replies });

    res.json({ success: true, reply });
  } catch (error) {
    console.error('Error posting reply:', error);
    res.status(500).json({ error: 'An error occurred while posting the reply' });
  }
};


router.post('/reply',replyPost)
router.post('/like', likePost);
buildRoutes(new ChatMessage(), router);

export default router;
