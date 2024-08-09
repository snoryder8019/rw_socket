const ModelHelper = require('../../helpers/models');
const modelName = 'gameSession';

class GameSession extends ModelHelper {
  constructor(gameSessionData) {
    super(`${modelName}s`);
    this.modelFields = {
      gameId: { type: 'text', value: null },
      playerIds: { type: 'array', value: [] },
      startTime: { type: 'date', value: null },
      endTime: { type: 'date', value: null },
      status: { type: 'text', value: null }
    };
    if (gameSessionData) {
      for (let key in this.modelFields) {
        if (gameSessionData[key] !== undefined) {
          this.modelFields[key].value = gameSessionData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new GameSession().modelFields).map(key => {
      const field = new GameSession().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  middlewareForCreateRoute() {
    return [];
  }

  middlewareForEditRoute() {
    return [];
  }

  get fileFields() {
    return [];
  }

  async uploadImagesToLinode(req, res, next) {
    next();
  }

  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }
}

module.exports = GameSession;
