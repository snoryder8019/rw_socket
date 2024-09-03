export default class GameTile {
    constructor(id, type, position = { x: 0, y: 0 }, visualRepresentation = {}) {
      this.id = id; // Unique identifier for the tile
      this.type = type; // Type of the tile, e.g., 'domino', 'table', 'element'
      this.position = position; // Position on the game board or screen
      this.visualRepresentation = visualRepresentation; // Object to hold visual properties like color, shape, etc.
    }
  
    setType(newType) {
      this.type = newType;
    }
  
    getType() {
      return this.type;
    }
  
    setPosition(x, y) {
      this.position = { x, y };
    }
  
    getPosition() {
      return this.position;
    }
  
    setVisualRepresentation(representation) {
      this.visualRepresentation = representation;
    }
  
    getVisualRepresentation() {
      return this.visualRepresentation;
    }
  
    render() {
      // Render logic for the visual representation of the tile
      console.log(`Rendering tile ${this.id} of type ${this.type} at position (${this.position.x}, ${this.position.y}) with visual properties:`, this.visualRepresentation);
    }
  }
  