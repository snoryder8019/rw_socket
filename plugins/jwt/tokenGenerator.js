import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWTSEC; // Always keep this secret and preferably in an environment variable

// Generate a token for a user
export function generateTokenForUser(payload, expiresIn = '1h') {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: expiresIn });
}

// Verify and decode a token
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error('Token verification failed:', err);
    return null;
  }
}
