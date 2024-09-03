import ModelHelper from '../../helpers/models.js';

export default class Ranking extends ModelHelper {
  constructor(rankingData) {
    super('rankings');
    this.modelFields = {
      playerId: { type: 'text', value: null }, // Player's unique identifier
      playerName: { type: 'text', value: null }, // Player's display name
      score: { type: 'number', value: null }, // Player's score
      rank: { type: 'number', value: null }, // Player's rank in the leaderboard
      dateAchieved: { type: 'date', value: null }, // Date when the high score was achieved
      gameType: { type: 'text', value: null }, // Type of game (optional)
    };

    if (rankingData) {
      for (let key in this.modelFields) {
        if (rankingData[key] !== undefined) {
          this.modelFields[key].value = rankingData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Ranking().modelFields).map((key) => {
      const field = new Ranking().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  async getLeaderboard(gameType, limit = 10) {
    try {
      const query = gameType ? { gameType } : {};
      const leaderboard = await this.find(query).sort({ score: -1 }).limit(limit).exec();
      return leaderboard;
    } catch (error) {
      console.error('Error retrieving leaderboard:', error);
      throw error;
    }
  }

  async updatePlayerScore(playerId, newScore) {
    try {
      const playerRanking = await this.findOne({ playerId });
      if (playerRanking) {
        if (newScore > playerRanking.score) {
          playerRanking.score = newScore;
          playerRanking.dateAchieved = new Date();
          await playerRanking.save();
        }
      } else {
        const newRanking = new Ranking({
          playerId,
          score: newScore,
          dateAchieved: new Date(),
        });
        await newRanking.save();
      }
    } catch (error) {
      console.error('Error updating player score:', error);
      throw error;
    }
  }

  async getPlayerRank(playerId) {
    try {
      const playerRanking = await this.findOne({ playerId });
      if (!playerRanking) return null;

      const rank = await this.countDocuments({ score: { $gt: playerRanking.score } }) + 1;
      return rank;
    } catch (error) {
      console.error('Error retrieving player rank:', error);
      throw error;
    }
  }
}
