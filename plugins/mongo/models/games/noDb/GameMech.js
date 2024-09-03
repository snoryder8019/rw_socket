export default class GameMech {
    constructor() {
      // Define properties related to game mechanics
      this.rules = [];
      this.actions = [];
    }
  
    addRule(rule) {
      this.rules.push(rule);
    }
  
    getRules() {
      return this.rules;
    }
  
    addAction(action) {
      this.actions.push(action);
    }
  
    getActions() {
      return this.actions;
    }
  
    applyAction(actionName, player) {
      const action = this.actions.find(act => act.name === actionName);
      if (action) {
        // Apply the action's effect to the player
        action.effect(player);
        return `${actionName} applied to ${player.name}`;
      }
      return `Action ${actionName} not found.`;
    }
  }
  