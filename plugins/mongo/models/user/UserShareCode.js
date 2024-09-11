//plugins/mongo/models/UserShareCode.js **GPT NOTE: DONT REMOVE THIS LINE IN EXAMPLES**
import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';
import User from '../User.js';


export default class UserShareCode extends ModelHelper {
    constructor(userShareCodeData) {
        super('userShareCodes');
        this.modelFields = {
            userId: { type: "text", value: null },
            shareId: { type: "text", value: null }
        };
    }

    async checkForUse(requestedId) {
        const result = await this.getAll({ "shareId": requestedId });
        return result.length > 0;  // Return true if code is in use
    }

    async generateCode(req, shareId) {
        const inUse = await this.checkForUse(shareId);
        const userId = req.user._id;  // Assuming req has user context (e.g., via middleware)
        if (!inUse) {
            const body = {
                userId: userId,
                shareId: shareId
            };
            const newId = await this.create(body);
            const update = { shareId: shareId };
            await new User().updateById(userId, update);
            return newId;
        }
        return null; // Return null if code is already in use
    }
}

