const ModelHelper = require('../helpers/models');

class Vote extends ModelHelper {
  constructor(voteData) {
    super('votes');
    this.modelFields = {
      userId: { type: 'text', value: null },             // ID of the user who cast the vote
      contentId: { type: 'text', value: null },          // ID of the content being voted on (e.g., blog post)
      contentType: { type: 'text', value: 'blog' },      // Type of content (e.g., blog, comment, etc.)
      voteType: { type: 'text', value: 'upvote' },       // Type of vote ('upvote', 'downvote', etc.)
      voteDate: { type: 'date', value: new Date() },     // Date when the vote was cast
      ipAddress: { type: 'text', value: null },          // IP address of the user for tracking (optional)
      userAgent: { type: 'text', value: null },          // User agent string for tracking (optional)
    };

    if (voteData) {
      for (let key in this.modelFields) {
        if (voteData[key] !== undefined) {
          this.modelFields[key].value = voteData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Vote().modelFields).map(key => {
      const field = new Vote().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  async countVotes(contentId, contentType = 'blog') {
    const db = getDb();
    const collection = db.collection(this.collectionName);
    const upvotes = await collection.countDocuments({ contentId, contentType, voteType: 'upvote' });
    const downvotes = await collection.countDocuments({ contentId, contentType, voteType: 'downvote' });
    return { upvotes, downvotes };
  }

  async userHasVoted(userId, contentId, contentType = 'blog') {
    const db = getDb();
    const collection = db.collection(this.collectionName);
    const vote = await collection.findOne({ userId, contentId, contentType });
    return vote !== null;
  }

  pathForGetRouteView() {
    return 'admin/votes/template';
  }
}

module.exports = Vote;
