// plugins/ndoemailer/setup.js
const nodemailer = require('nodemailer');
const axios = require('axios');
const env = require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getDb } = require('../mongo/mongo');
const { ObjectId } = require('mongodb');
const emailStyle0 = require('./styles/emailStyle0');
const config = require('../../config/config');
const querystring = require('querystring');

const emailHeaderUrl = `${config.baseUrl}images/logoTransp.png`;


async function initializeTransporter(tokenName) {
    const db = await getDb();
    const collection = db.collection('tokens');
   // console.log(collection)
    // Find the token document by name
    const tokenDoc = await collection.findOne({ name:"access_tokens"});

    if (!tokenDoc || !tokenDoc.access_token) {
        throw new Error('Valid token not found in database for the given name.');
    }
}
    //console.log(tokenDoc.access_token,tokenDoc.refresh_token)
//MICROSOFT  IMPLIMENTATIONS
//     transporter = nodemailer.createTransport({
//         host: config.emailService,
//         port: 587,
//         secure: false,
//         auth: {
//             type: 'OAuth2',
//             user: process.env.NODEMAILER_USER,
//             clientId: process.env.MS_CID,
//             clientSecret: process.env.MS_SEC,
//             refreshToken: tokenDoc.refresh_token,
//             accessToken: tokenDoc.access_token,
//             expires:tokenDoc.expires
//             // The expires field might not be directly used by Nodemailer; you may need to handle token refresh manually.
//         },
//     });
// }


let transporter = nodemailer.createTransport({
    service: 'Gmail',
    port:587,
    auth:{user: process.env.GMAIL_USER,pass:process.env.GMAIL_PASS}
})



const sendDynamicEmail = async (to, emailType, user, card, dynamicLink, ticket) => {
    await initializeTransporter();
    const settings = {
        confirmation: {
            subject: 'Confirm Your Email',
            templateName: 'confirmation.html'
        },
        passwordReset: {
            subject: 'Password Reset Instructions',
            templateName: 'passwordReset.html'
        },
        orderComplete: {
            subject: 'Your Order is Complete',
            templateName: 'orderComplete.html'
        },
        orderNotify: {
            subject: 'You have a new Order',
            templateName: 'orderNotify.html'
        },
        ticketAdded: {
            subject: 'New Ticket Opened',
            templateName: 'newTicket.html'
        },
        general: {
            subject: 'RHS Trading Cards sent you a message',
            templateName: 'generalBody.html'
        }
    }[emailType];
    if (!settings) throw new Error(`Unknown email type: ${emailType}`);

    const templatePath = path.join(__dirname, 'templates', settings.templateName);
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8')
        .replace('{firstName}', user.firstName)
        .replace('{dynamicLink}', dynamicLink)
        .replace('{emailheader}', emailHeaderUrl)
       // .replace('{dynamicBody}', emailBody);

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject: settings.subject,
        html: htmlTemplate
    };
    return transporter.sendMail(mailOptions);
};

const oauthCallbackHandler = async (req, res) => {
    const requestBody = querystring.stringify({
        client_id: process.env.MS_CID,
        client_secret: process.env.MS_SEC_VALUE,
        code: req.query.code,
        redirect_uri: 'http://localhost:3000/oauth/callback',
        grant_type: 'authorization_code'
    });

    try {
        const response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', requestBody, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const {token_type,scope, access_token,refresh_token,  expiresIn } = response.data;
        const db = await getDb();
        await db.collection('tokens').updateOne({}, {
            $set: {
                "name":"access_tokens",
                token_type,
                scope,
                access_token,
               refresh_token,

                expires: new Date(Date.now() + expiresIn * 1000)
            }
        }, { upsert: true });
        res.send('Authorization successful. Tokens updated in the database.');
    } catch (error) {
        console.error('Error exchanging authorization code:', error);
        res.status(500).send('Failed to exchange authorization code.');
    }
};


const emailOutGeneral = async (req, res) => {
    try {
        const { to, emailBody, username } = req.body;

        // Read the email template
        const templatePath = path.join(__dirname, 'templates', 'generalBody.html');
        const htmlTemplate = fs.readFileSync(templatePath, 'utf8')
            .replace('{dynamicBody}', emailBody)
            .replace('{dynamicLink}', 'https://cards.royalsplendor.com')
            .replace('{unsubscribeLink}', 'https://cards.royalsplendor.com/unsubscribe'); // Assuming you have an unsubscribe link

        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Update with your email service provider
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        // Set mail options
        const mailOptions = {
            from: process.env.GMAIL_USER, // Sender's email address
            to: to, // Recipient's email address
            subject: 'Message from RHS Trading Cards', // Email subject
            html: htmlTemplate // Email content
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Send a response indicating that the email was sent successfully
        res.status(200).send("Email sent successfully.");
    } catch (error) {
        console.error(`Error sending email: ${error}`);
        res.status(500).send(`Error sending email: ${error}`);
    }
};

module.exports = {
    sendDynamicEmail,
    oauthCallbackHandler,
    emailOutGeneral
};
