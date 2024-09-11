import express from 'express';
import UserShareCode from '../../../plugins/mongo/models/user/UserShareCode.js';
import User from '../../../plugins/mongo/models/User.js';

const router = express.Router();

// Route to check if the share code is in use
router.get('/checkForUse', async (req, res) => {
    const requestedId = req.query.requestedId;  // Use req.query for GET request
    if (!requestedId) {
        return res.status(400).json({ error: 'Requested ID is missing' });
    }

    try {
        const isInUse = await new UserShareCode().checkForUse(requestedId);
        res.status(200).json({ inUse: isInUse });  // Send JSON response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to add shareId to the user
router.post('/addShareIdToUser', async (req, res) => {
    const {requestedId} = req.body;
const userId = req.user._id;
    if (!requestedId) {
        return res.status(400).json({ error: 'Share ID is missing' });
    }

    try {
        // First, check if the shareId is already in use
        const isInUse = await new UserShareCode().checkForUse(requestedId);
        if (isInUse) {
            return res.status(400).json({ error: 'Share code is already in use.' });
        }

        // Add the shareId to UserShareCode and link it with the user
        const shareCodeResult =  await new UserShareCode().create({ "userId":userId, "shareId":requestedId });

        // Update the user record to include the shareId
   console.log(shareCodeResult)
        await new User().updateById(userId, { "shareId":requestedId});

        res.status(200).json({ message: 'Share ID added to user successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
