const express = require('express');
const router = express.Router();
const { getDb } = require('../../plugins/mongo/mongo');
const { ObjectId } = require('mongodb');
const config = require('../../config/config');
const lib = require('../logFunctions/logFunctions');
const fs = require('fs');

function isAdmin(req, res, next) {
  let user = req.user;
  console.log('ADMIN ACCESS: accessing admin routes: ' + user.displayName);

  if (user && user.isAdmin) {
    next();
  } else {
    req.flash('error', 'Unauthorized. Please log in as an admin.');
    res.redirect('/');
  }
}
const ticketUpdate = async (req, res) => {
  try {
    const db = getDb();
    const ticketsCollection = db.collection('tickets');
    const usersCollection = db.collection('users');

    const { ticketId, status, devUpdate, source } = req.body; // Extract devUpdate
    const updatedTime = new Date(); // Get the current timestamp

    const updatedTicket = await ticketsCollection.findOneAndUpdate(
      { _id: new ObjectId(ticketId) },
      {
        $set: { status: status },
        $push: { devUpdates: { timestamp: updatedTime, message: devUpdate, source:source } }, // Update status and push the updated timestamp along with the devUpdate message
      },
      { returnOriginal: false }
    );

    if (updatedTicket.value) {
      // Update corresponding ticket in user
      const userId = updatedTicket.value.userId;
      await usersCollection.updateOne(
        { _id: userId, 'tickets._id': new ObjectId(ticketId) },
        { $set: { 'tickets.$.status': status } }
      );

      req.flash('success', 'Ticket updated successfully.');
    } else {
      req.flash('error', 'Ticket not found or update failed.');
    }
  } catch (err) {
    console.error("Error in Update Ticket: ", err);
    req.flash('error', 'An error occurred while updating the ticket.');
  }

  const backURL = req.header('Referer') || '/';
  console.log("Redirecting to: ", backURL);
  res.redirect(backURL);
};

const ticketDelete = async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection('tickets');
    const { ticketId } = req.body;

    // Flag for deletion using upsert
    const updateResult = await collection.updateOne(
      { _id: new ObjectId(ticketId) },
      { $set: { isDeleted: true } },
      { upsert: false } // Don't create a new document
    );

    if (updateResult.modifiedCount === 1) {
      req.flash('success', 'Ticket flagged for deletion successfully.');
    } else {
      req.flash('error', 'Ticket not found or flagging for deletion failed.');
    }
  } catch (err) {
    console.error("Error in Flag for Deletion: ", err);
    req.flash('error', 'An error occurred while flagging the ticket for deletion.');
  }

  const backURL = req.header('Referer') || '/';
  console.log("Redirecting to: ", backURL);
  res.redirect('/admin');
};



const ticketData = async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection('tickets');
    const { ticketId } = req.body;

    const deleteResult = await collection.deleteOne({ _id: new ObjectId(ticketId) });

    if (deleteResult.deletedCount === 1) {
      req.flash('success', 'Ticket deleted successfully.');
    } else {
      req.flash('error', 'Ticket not found or delete failed.');
    }
  } catch (err) {
    console.error("Error in Delete Ticket: ", err);
    req.flash('error', 'An error occurred while deleting the ticket.');
  }

  const backURL = req.header('Referer') || '/';
  console.log("Redirecting to: ", backURL);
  res.redirect('/admin');
};

module.exports = { ticketUpdate, ticketDelete, ticketData };
