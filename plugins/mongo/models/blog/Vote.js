import ModelHelper from '../../helpers/models.js';

export default class Vote extends ModelHelper {
  constructor(voteData) {
    super('votes');
    this.modelFields = {

      question: { type: 'text', value: null },
      options: { type: 'array', value: [] },
      voteType: { type: 'text', value: null },
      records: { type: 'array', value: [] },//users id#
      createdAt: { type: 'date', value: new Date() },
      updatedAt: { type: 'date', value: new Date() }
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
    return Object.keys(new Vote().modelFields).map((key) => {
      const field = new Vote().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  middlewareForCreateRoute() {
    return [
      this.validateVote.bind(this),
      this.checkIfAlreadyVoted.bind(this),
    ];
  }

  middlewareForEditRoute() {
    return [
      this.validateVote.bind(this),
    ];
  }

  async validateVote(req, res, next) {
    try {
      const { voterId, blogId, voteType } = req.body;
      if (!voterId || !blogId || !['upvote', 'downvote'].includes(voteType)) {
        throw new Error('Invalid vote data');
      }
      next();
    } catch (error) {
      console.error('Error in validateVote middleware:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async checkIfAlreadyVoted(req, res, next) {
    try {
      const { voterId, blogId } = req.body;
      const existingVote = await this.findOne({ voterId, blogId });
      if (existingVote) {
        throw new Error('User has already voted on this blog');
      }
      next();
    } catch (error) {
      console.error('Error in checkIfAlreadyVoted middleware:', error);
      res.status(400).json({ error: error.message });
    }
  }

  pathForGetRouteView() {
    return 'admin/votes/template';
  }
  
  async updateVoteCount(blogId, voteType) {
    // Logic to update the vote count for a blog
  }
}
