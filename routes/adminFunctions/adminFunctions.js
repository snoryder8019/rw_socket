var express = require('express');
var router = express.Router();
const path = require('path')
const upload = require('../../plugins/multer/setup');
const { getDb } = require('../../plugins/mongo/mongo');
const { ObjectId } = require('mongodb');
const config = require('../../config/config'); // Import config if you're using it
const lib = require('../logFunctions/logFunctions')
const fs = require('fs')

// hmm isAdmin Middleware
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
//use of flash and lib
  //  lib('card updated:', 'no errors from lib():', { cardID,userName }, 'cards.json','data');
 // req.flash('success', 'Card updated successfully.');
   






module.exports = { isAdmin };
