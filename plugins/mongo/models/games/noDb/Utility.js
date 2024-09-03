export default class Utility {
    static randomNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  
    static formatDate(date) {
      return date.toISOString().split('T')[0];
    }
  
    static cloneObject(obj) {
      return JSON.parse(JSON.stringify(obj));
    }
  
    static distanceBetweenPoints(x1, y1, x2, y2) {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
  }
  