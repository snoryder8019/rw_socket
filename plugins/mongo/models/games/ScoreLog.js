import ModelHelper from '../../helpers/models.js';

const modelName = 'scoreLog';

export default class ScoreLog extends ModelHelper {
  constructor(scoreLogData) {
    super(`${modelName}s`);
    this.modelFields = {
      logId: { type: 'text', value: null },
      playerId: { type: 'text', value: null },
      victory: { type: 'boolean', value: null },
      gameId: { type: 'text', value: null },
      sessionId: { type: 'text', value: null },
      score: { type: 'number', value: null },
      timestamp: { type: 'date', value: null },
    };
    if (scoreLogData) {
      for (let key in this.modelFields) {
        if (scoreLogData[key] !== undefined) {
          this.modelFields[key].value = scoreLogData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new ScoreLog().modelFields).map((key) => {
      const field = new ScoreLog().modelFields[key];
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
