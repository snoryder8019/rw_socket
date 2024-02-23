
var express = require('express');
var router = express.Router();
const { getDb } = require('../mongo/mongo');
const bcrypt = require('bcrypt');
const config = require('../../config/config'); 
const mailer = require('../../plugins/nodemailer/setup');
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
async function createUser(newUser) {
    const db = getDb();
    const emailCheck = await db.collection('users').findOne({ email: newUser.email });
    if (emailCheck) {
        console.log(emailCheck);
        console.log('This email is Taken');
        const libLog = {
            "errorMessage":'DB returned email is taken',
            "attempted email":newUser          

        }
        lib('login error: ', 'error: Email Taken', libLog,'errors.json','data')
        return { success: false, message: 'Email is already taken' }; // Return a custom message
    } else {
        const result = await db.collection("users").insertOne(newUser);
        // Fetch the created user and return
        const createdUser = await db.collection("users").findOne({ _id: result.insertedId });
        
        if (createdUser && createdUser.password) {
            let hash = await bcrypt.hash(createdUser.password, 10);
            await db.collection("users").updateOne({ _id: createdUser._id }, { $set: { "password": hash } });
        }

        return { success: true, user: createdUser }; // Return a success status and the created user
    }
}
router.post('/requestEmailConf', async (req, res) => {
    try {
        const db = getDb();
        const confirmationToken = generateResetToken(); // Generate a confirmation token

        const dynamicLink = `${config.baseUrl}confirm/${confirmationToken}`; // Construct the confirmation link
        const emailType = 'confirmation'; // Use the confirmation email type
        const registrarsEmail = req.user.email;
        const user = {
            firstName: req.user.firstName // Add other user-specific data as needed
        };

        // Save the confirmation token to the user's database document
        await db.collection('users').updateOne(
            { email: registrarsEmail },
            { $set: { confirmationToken: confirmationToken } }
        );

        await sendDynamicEmail(registrarsEmail, emailType, user, null, dynamicLink, null);
        const libLog = {
            "userEmail":user,
            "sentEmail":registrarsEmail,
            "dynamicLink": dynamicLink,

        }
        lib('confirmation email sent: ',null,libLog,'confEmails.json','data')
        req.flash('success', 'Registration successful! Logged in successfully.');
        return res.render('registeredPassword', { pageType: "registration", user: user });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Server Error');
        res.status(500).send('Server Error');
    }
});

router.post('/regUser', async (req, res) => {
    try {
        const confirmationToken = generateResetToken(); // Generate a confirmation token
        const createUserResult = await createUser({
            provider: 'local',
            providerId: 'local' + Date.now(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            isAdmin: false,
            createdAt: Date.now(),
            cart: [],
            confirmationToken: confirmationToken, // Save the confirmation token to the user object
        });

        const redirectUrl = req.headers.referer || '/default-route';

        if (createUserResult.success) {

            const dynamicLink = `${config.baseUrl}confirm/${confirmationToken}`; // Construct the confirmation link
            const emailType = 'confirmation'; // Use the confirmation email type
            const registrarsEmail = req.body.email;
            const user = {
                firstName: req.body.firstName // Add other user-specific data as needed
            };
            const libLog = {
                "userEmail":user.email,
                "sentEmail":registrarsEmail,
                "dynamicLink": dynamicLink,
    
            }
            lib('reg email sent: ',null,libLog,'regEmails.json','data')
            await sendDynamicEmail(registrarsEmail, emailType, user, null, dynamicLink, null);

            // Registration and login succeeded
            req.logIn(createUserResult.user, err => {
                if (err) {
                    console.log(err);
                    req.flash('error', 'Login after registration failed.');
                    return res.status(500).send('Error logging in');
                }
                // Flash success message
                req.flash('success', 'Registration successful! Logged in successfully.');
                return res.render('registeredPassword',{pageType:"registration", user:user});
            });
        } else {
            // Registration failed
            req.flash('error', createUserResult.message); // Display the custom message
            res.redirect(redirectUrl);
        }
    } catch (err) {
        console.log(err);
        req.flash('error', 'Server Error');
        res.status(500).send('Server Error');
    }
});

router.get('/registeredPassword', (req,res)=>{
    console/log('registeredPassword')
    res.render('registeredPassword',{pageType:"hmmmm"})
})
router.get('/confirm/:token', async (req, res) => {
    try {
        const token = req.params.token;
        const db = getDb();

        // Find the user with the given confirmation token
        const user = await db.collection('users').findOne({ confirmationToken: token });

        if (user) {
            // Update the user's account to mark it as confirmed
            await db.collection('users').updateOne(
                { _id: user._id },
                { $set: { isConfirmed: "true", confirmedEmail: user.email }, $unset: { confirmationToken: '' } }
            );

            req.flash('success', 'Thank you for confirming your email');
            // Redirect the user to a confirmation success page
            res.redirect('/'); // Adjust this based on your view setup
        } else {
            // Token is invalid or user not found
            req.flash('error', 'Something went wrong with the confirmation');
            res.redirect('/')
        }
    } catch (err) {
        console.error(err);
        req.flash('error', 'there was an error');
        res.redirect('/')
    }
});

module.exports = {
  router: router,
  createUser: createUser
};

