import ModelHelper from '../../helpers/models.js';

const modelName = 'gameRoom';

export default class GameRoom extends ModelHelper {
  constructor(gameRoomData) {
    super(`${modelName}s`);
    this.modelFields = {
      roomId: { type: 'text', value: null },
      gameId: { type: 'text', value: null },
      playerIds: { type: 'array', value: [] },
      status: { type: 'text', value: null },
      maxPlayers: { type: 'number', value: null },
    };
    if (gameRoomData) {
      for (let key in this.modelFields) {
        if (gameRoomData[key] !== undefined) {
          this.modelFields[key].value = gameRoomData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new GameRoom().modelFields).map((key) => {
      const field = new GameRoom().modelFields[key];
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
