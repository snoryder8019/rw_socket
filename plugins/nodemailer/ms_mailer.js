import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.MS_CLIENT_ID, // Client ID
  process.env.MS_CLIENT_SECRET, // Client Secret
  process.env.MS_REDIRECT_URL // Redirect URL
);

oauth2Client.setCredentials({
  refresh_token: process.env.MS_REFRESH_TOKEN,
});

const accessToken = oauth2Client.getAccessToken();

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'Outlook365',
  auth: {
    type: 'OAuth2',
    user: process.env.MS_EMAIL,
    clientId: process.env.MS_CLIENT_ID,
    clientSecret: process.env.MS_CLIENT_SECRET,
    refreshToken: process.env.MS_REFRESH_TOKEN,
    accessToken: accessToken,
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

// Example function to send an email
export const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
    });
    console.log('Message sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
