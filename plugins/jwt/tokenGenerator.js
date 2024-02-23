// plugins/tokenGenerator.js

const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWTSEC; // Always keep this secret and preferably in an environment variable

// Generate a token for a user
function generateTokenForUser(payload, expiresIn = '1h') {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: expiresIn });
}

// Verify and decode a token
function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (err) {
        console.error('Token verification failed:', err);
        return null;
    }
}

module.exports = {
    generateTokenForUser,
    verifyToken
};
