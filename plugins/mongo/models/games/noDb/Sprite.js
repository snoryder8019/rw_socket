export default class Sprite {
    constructor() {
      // Define properties related to the game interface
      this.spriteElement = [];
    }
  
    addElement(element) {
      this.spriteElement.push(element);
    }
  
    removeElement(elementId) {
      this.spriteElement = this.spriteElement.filter(el => el.id !== elementId);
    }
  
    getElements() {
      return this.spriteElement;
    }
  
    render() {
      // Code to render the interface
    }
  }
  