var express = require('express');
var router = express.Router();
const config = require('../../config/config'); // Import config if you're using it
const { getDb } = require('../../plugins/mongo/mongo');
const lib = require('../../routes/logFunctions/logFunctions');
const { ObjectId } = require('mongodb');

const saveOrUpdateOrderForPaypal = async (customId, additionalData) => {
    try {
        const db = getDb();
        const ordersPaypal = db.collection('orders_paypal');

        // Check if an order with the given confirmationId already exists
        const existingOrder = await ordersPaypal.findOne({ "customId": customId });
        if (existingOrder) {
            console.log(`Order already exists with confirmation ID: ${customId}`);
            return existingOrder; // or handle as needed
        }

        // Build the new order object with additional data
        const newOrder = {
           customId:customId,
            ...additionalData // Spread in additional data that you will pass
        };

        // Save the new order to the collection
        const insertResult = await ordersPaypal.insertOne(newOrder);
        if (!insertResult.insertedId) {
            throw new Error('Failed to save new order');
        }
        console.log(`New order saved with ID: ${insertResult.insertedId}`);

        // Retrieve and return the newly saved order
        const savedOrder = await ordersPaypal.findOne({ "_id": insertResult.insertedId });
        return savedOrder; // Return the saved order document
    } catch (error) {
        console.error(error);
        throw error;
    }
};
const getUserforPaypal = async (userId) => {
    try {
        const db = getDb();
        const newId = new ObjectId(userId)
        const users = db.collection('users');
        const user = await users.findOne({"_id": newId}); // Assuming '_id' is the correct field
        console.log(`User fetched: ${user._id}`);
        return user;
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error for the caller to handle
    }
}

const getCardforPaypal = async (cardId) => {
    try {
        const db = getDb();
        const newId = new ObjectId(cardId)
        const cards = db.collection('_cards');
        const card = await cards.findOne({"_id": newId}); // Use the correct field to find the card
        console.log(`Card fetched: ${card._id}`);
        return card;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
const getOrderforPaypal = async (orderId)=>{
    try{
    const db = getDb();
   // const newId = new ObjectId(orderId)
    const orders = db.collection('orders_payapl');
    const order = await orders.findOne({"customId": orderId}); // Assuming '_id' is the correct field
    console.log(`User fetched: ${order}`);
    return order;
} catch (error) {
    console.error(error);
    throw error; // Rethrow the error for the caller to handle
}
}


const updatePaypalOrder = async (orderId, updateFields) => {
    console.log('UPDATEPAYPALORDER')
    try {
        // Check if updateFields is valid
        if (!updateFields || Object.keys(updateFields).length === 0) {
            throw new Error("updateFields is empty or invalid");
        }

        const db = getDb();
        const ordersPaypal = db.collection('orders_paypal');

        const updateResult = await ordersPaypal.updateOne(
            { "customId": orderId },
            { $set: updateFields }
        );

        console.log(`Order updated: ${updateResult.modifiedCount} document(s)`);
        return updateResult;
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error for the caller to handle
    }
};


module.exports = {getOrderforPaypal,saveOrUpdateOrderForPaypal , getCardforPaypal, getUserforPaypal,updatePaypalOrder};