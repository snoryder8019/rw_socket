const ModelHelper = require('../../helpers/models');
const modelName = 'transaction';

class Transaction extends ModelHelper {
  constructor(transactionData) {
    super(`${modelName}s`);
    this.modelFields = {
      userId: { type: 'text', value: null },               // ID of the user making the transaction
      itemId: { type: 'text', value: null },               // ID of the item being purchased
      itemName: { type: 'text', value: null },             // Name of the item
      priceInGems: { type: 'number', value: null },        // Amount of gems spent
      transactionDate: { type: 'date', value: new Date() },// Date of the transaction
      status: { type: 'text', value: 'pending' },          // Status of the transaction (e.g., pending, completed)
      userBalanceBefore: { type: 'number', value: null },  // User's gem balance before the transaction
      userBalanceAfter: { type: 'number', value: null },   // User's gem balance after the transaction
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
    return Object.keys(new Transaction().modelFields).map(key => {
      const field = new Transaction().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  async recordTransaction(userId, itemId, priceInGems, userBalanceBefore) {
    const db = getDb();
    const collection = db.collection(this.collectionName);

    const transactionData = {
      userId,
      itemId,
      priceInGems,
      userBalanceBefore,
      userBalanceAfter: userBalanceBefore - priceInGems,
      transactionDate: new Date(),
      status: 'completed'
    };

    const result = await collection.insertOne(transactionData);
    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    } else {
      throw new Error('Failed to record transaction');
    }
  }

  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }
}

module.exports = Transaction;
