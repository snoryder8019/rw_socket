import ModelHelper from '../../helpers/models.js';

export default class Item extends ModelHelper {
  constructor(itemData) {
    super('items');
    this.modelFields = {
      name: { type: 'text', value: null },
      description: { type: 'textarea', value: null },
      price: { type: 'number', value: 0 },
      stock: { type: 'number', value: 0 },
      category: { type: 'text', value: null },
      images: { type: 'array', value: [] }, // Array of image URLs
      createdAt: { type: 'date', value: new Date() },
      updatedAt: { type: 'date', value: new Date() }
    };

    if (itemData) {
      for (let key in this.modelFields) {
        if (itemData[key] !== undefined) {
          this.modelFields[key].value = itemData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Item().modelFields).map((key) => {
      const field = new Item().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  middlewareForCreateRoute() {
    return [
      this.validateItem.bind(this),
      this.checkStockAvailability.bind(this),
    ];
  }

  middlewareForEditRoute() {
    return [
      this.validateItem.bind(this),
    ];
  }

  async validateItem(req, res, next) {
    try {
      const { name, price, stock } = req.body;
      if (!name || price < 0 || stock < 0) {
        throw new Error('Invalid item data: Name, positive price, and stock are required.');
      }
      next();
    } catch (error) {
      console.error('Error in validateItem middleware:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async checkStockAvailability(req, res, next) {
    try {
      const { stock } = req.body;
      if (stock < 0) {
        throw new Error('Invalid stock value: Stock cannot be negative.');
      }
      next();
    } catch (error) {
      console.error('Error in checkStockAvailability middleware:', error);
      res.status(400).json({ error: error.message });
    }
  }

  pathForGetRouteView() {
    return 'admin/items/template';
  }

  async updateStock(itemId, quantity) {
    try {
      const item = await this.getById(itemId);
      if (!item) {
        throw new Error('Item not found.');
      }

      item.stock = Math.max(0, item.stock - quantity);
      item.updatedAt = new Date();
      await this.update(itemId, item);
    } catch (error) {
      console.error('Error in updateStock method:', error);
      throw error;
    }
  }
}
