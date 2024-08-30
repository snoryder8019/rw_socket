import ModelHelper from '../../helpers/models.js';

export default class Transaction extends ModelHelper {
  constructor(transactionData) {
    super('transactions');
    this.modelFields = {
      userId: { type: 'text', value: null },
      itemIds: { type: 'array', value: [] }, // Array of item IDs involved in the transaction
      totalAmount: { type: 'number', value: 0 },
      status: { type: 'text', value: 'pending' }, // e.g., 'pending', 'completed', 'cancelled'
      paymentMethod: { type: 'text', value: null },
      transactionDate: { type: 'date', value: new Date() },
      createdAt: { type: 'date', value: new Date() },
      updatedAt: { type: 'date', value: new Date() }
    };

    if (transactionData) {
      for (let key in this.modelFields) {
        if (transactionData[key] !== undefined) {
          this.modelFields[key].value = transactionData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Transaction().modelFields).map((key) => {
      const field = new Transaction().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  middlewareForCreateRoute() {
    return [
      this.validateTransaction.bind(this),
      this.calculateTotalAmount.bind(this),
    ];
  }

  middlewareForEditRoute() {
    return [
      this.validateTransaction.bind(this),
    ];
  }

  async validateTransaction(req, res, next) {
    try {
      const { userId, itemIds, paymentMethod } = req.body;
      if (!userId || !Array.isArray(itemIds) || itemIds.length === 0 || !paymentMethod) {
        throw new Error('Invalid transaction data: User ID, items, and payment method are required.');
      }
      next();
    } catch (error) {
      console.error('Error in validateTransaction middleware:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async calculateTotalAmount(req, res, next) {
    try {
      const { itemIds } = req.body;
      let totalAmount = 0;

      for (let itemId of itemIds) {
        const item = await new Item().getById(itemId);
        if (item) {
          totalAmount += item.price;
        }
      }

      req.body.totalAmount = totalAmount;
      next();
    } catch (error) {
      console.error('Error in calculateTotalAmount middleware:', error);
      res.status(400).json({ error: error.message });
    }
  }

  pathForGetRouteView() {
    return 'admin/transactions/template';
  }

  async updateTransactionStatus(transactionId, status) {
    try {
      const transaction = await this.getById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found.');
      }

      transaction.status = status;
      transaction.updatedAt = new Date();
      await this.update(transactionId, transaction);
    } catch (error) {
      console.error('Error in updateTransactionStatus method:', error);
      throw error;
    }
  }
}
