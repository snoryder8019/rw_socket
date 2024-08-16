import ModelHelper from '../../helpers/models.js';

const modelName = 'gameLog';

export default class GameLog extends ModelHelper {
  constructor(gameLogData) {
    super(`${modelName}s`);
    this.modelFields = {
      logId: { type: 'text', value: null },
      gameId: { type: 'text', value: null },
      sessionId: { type: 'text', value: null },
      playerId: { type: 'text', value: null },
      action: { type: 'text', value: null },
      timestamp: { type: 'date', value: null },
    };
    if (gameLogData) {
      for (let key in this.modelFields) {
        if (gameLogData[key] !== undefined) {
          this.modelFields[key].value = gameLogData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new GameLog().modelFields).map((key) => {
      const field = new GameLog().modelFields[key];
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
