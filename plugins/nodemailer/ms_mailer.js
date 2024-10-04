import nodemailer from 'nodemailer';
import { connect, getDb } from '../mongo/mongo.js';
import { ConfidentialClientApplication } from '@azure/msal-node';

const msalConfig = {
  auth: {
    clientId: process.env.MS_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.MS_TENANT_ID}`,
    clientSecret: process.env.MS_CLIENT_SECRET,
  },
};

export const cca = new ConfidentialClientApplication(msalConfig);

let db;

export const initializeDb = async () => {
  try {
    db = await getDb();
  } catch (error) {
    console.error('Error getting DB:', error);
    await connect();
    db = await getDb();
  }
};

const initializeOAuth2Client = async () => {
  const tokenDoc = await db
    .collection('tokens')
    .findOne({ name: 'access_tokens' });

  console.log('Token doc:', tokenDoc);
  if (tokenDoc?.refresh_token) {
    cca
      .acquireTokenByRefreshToken({
        refreshToken: tokenDoc.refresh_token,
        scopes: ['https://graph.microsoft.com/.default', 'offline_access'],
      })
      .then((response) => {
        cca.setCredentials({
          refresh_token: response.refreshToken,
        });
      })
      .catch((error) => {
        throw new Error('Error acquiring token by refresh token');
      });
  } else {
    throw new Error(
      'No refresh token found in the database. Please authenticate by visiting /auth'
    );
  }

  // Define the refresh handler callback
  cca.on('tokens', async (tokens) => {
    if (tokens.refreshToken) {
      // Save the new refresh token to the database
      await db
        .collection('tokens')
        .updateOne(
          { name: 'access_tokens' },
          { $set: { refresh_token: tokens.refreshToken } },
          { upsert: true }
        );
    }
  });

  return cca;
};

const createTransporter = async () => {
  const accessToken = await cca.acquireTokenSilent({
    account: cca.getAccountByHomeId(process.env.MS_ACCOUNT_ID),
    scopes: ['https://graph.microsoft.com/.default', 'offline_access'],
  });

  // Create a transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
      type: 'OAuth2',
      user: process.env.MS_EMAIL,
      clientId: process.env.MS_CLIENT_ID,
      clientSecret: process.env.MS_CLIENT_SECRET,
      refreshToken: cca.credentials.refresh_token,
      accessToken: accessToken.accessToken,
    },
  });

  // Verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error('Error configuring transporter:', error);
    } else {
      console.log('Transporter configured successfully:', success);
    }
  });

  return transporter;
};

export const sendEmail = async (to, subject, text) => {
  try {
    await initializeDb();
    await initializeOAuth2Client();
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: process.env.MS_EMAIL, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
    });
    console.log('Message sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const initializeAuth = (req, res) => {
  const authCodeUrlParameters = {
    scopes: ['https://graph.microsoft.com/.default', 'offline_access'],
    redirectUri: process.env.MS_REDIRECT_URL,
  };

  cca
    .getAuthCodeUrl(authCodeUrlParameters)
    .then((response) => {
      res.redirect(response);
    })
    .catch((error) => console.log(JSON.stringify(error)));
};

export const handleAuthCallback = async (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ['https://graph.microsoft.com/.default', 'offline_access'],
    redirectUri: process.env.MS_REDIRECT_URL,
  };

  try {
    const response = await cca.acquireTokenByCode(tokenRequest);
    const tokens = response;
    console.log('tokens:', tokens);

    // Save the refresh token to the database
    await initializeDb();
    await db
      .collection('tokens')
      .updateOne(
        { name: 'access_tokens' },
        { $set: { refresh_token: tokens.refreshToken } },
        { upsert: true }
      );

    res.send('Authentication successful! You can close this window.');
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.send('Error during authentication');
  }
};

export const testEmail = async (req, res) => {
  sendEmail(process.env.TEST_EMAIL, 'Test Email', 'This is a test email');
};
