
const express = require('express');
const router = express.Router();
const { getDb } = require('../mongo/mongo');
const bcrypt = require('bcrypt');
const { generateTokenForUser } = require('../jwt/tokenGenerator');
const {sendDynamicEmail} = require('../../plugins/nodemailer/setup');
const crypto = require('crypto');
const lib =require('../../routes/logFunctions/logFunctions')
// Function to generate a random reset token
const generateResetToken = () => {
    // Generate a random 32-character hexadecimal token
    const token = crypto.randomBytes(16).toString('hex');
    return token;
};

module.exports = {
    generateResetToken
};


// Function to handle password reset request
const resetPasswordRequest = async (req, res) => {
    try {
        const email = req.body.email;
        const db = getDb();
        const user = await db.collection('users').findOne({ email: email });
        
        if (user) {
            // Generate a reset token here
            const resetToken = generateResetToken(); // Implement this function

            // Save the reset token and set an expiration timestamp in the user document
            const expirationTime = new Date();
            expirationTime.setHours(expirationTime.getHours() + 1); // Token expires in 1 hour

            await db.collection('users').updateOne(
                { _id: user._id },
                { $set: { resetToken: resetToken, resetTokenExpiration: expirationTime } }
            );

            const dynamicLink = `${config.baseUrl}reset-password/${resetToken}`;
            console.log(dynamicLink);
            const libLog = {
                "userEmail":user.email,
                "sentEmail":email,
                "dynamicLink": dynamicLink,    
            }
            lib('password reset req:',null, libLog, 'passReset.json', 'data')
            await sendDynamicEmail(email, 'passwordReset', user, null, dynamicLink);
            return res.render('registeredPassword',{pageType:"password"});
        } else {
            console.log('User not found');
            return res.status(404).send('User not found.');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server Error');
    }
};

// Function to handle password reset
const resetPassword = async (req, res) => {
    try {
        const token = req.params.token;
        const newPassword = req.body.newPassword;
        const db = getDb();
        
        // Find the user with the given token
        const user = await db.collection('users').findOne({ resetToken: token });
        
        if (user) {
            // Hash and update the new password
            const hash = await bcrypt.hash(newPassword, 10);
           const response = await db.collection('users').updateOne(
                { _id: user._id },
                { $set: { password: hash }, $unset: { resetToken: '' } }
            );
            console.log(response)
            req.flash('success','Password Reset! please login')
          res.redirect('/')
          
        } else {
            return res.status(404).send('Invalid or expired token.');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server Error');
    }
};
//reset redirect object needed to export
//
// Object for reset redirect logic (exported as an object)
const resetRedirect = async (req, res) => {

        try {
            // Implement the logic for rendering the reset-password.ejs view here
            // You can retrieve any necessary data and render the view
            res.render('reset-password'); // Adjust this based on your view setup
        } catch (err) {
            console.error(err);
            return res.status(500).send('Server Error');
        }
    }

// Create a module for handling the reset password GET request
const handleResetPasswordGet = (req, res) => {
    try {
        // Retrieve the reset token from the request parameters
        const resetToken = req.params.token;

        // You can now use the resetToken for validation or further processing
        // For example, you can check if the token is valid and not expired

        // Render the reset-password.ejs view and pass the resetToken as an object
        res.render('reset-password', { resetToken }); // Adjust this based on your view setup
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server Error');
    }
};

module.exports = { resetPasswordRequest, resetPassword, resetRedirect, handleResetPasswordGet };
