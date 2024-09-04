// test/testConfig.js

import { ObjectId } from 'mongodb';

// Mock user data
export const testUsers = {
  adminUser: {
    _id: new ObjectId('60d5f9d8f294e1c42e84f129'), // Example BSON ObjectId
    firstName: 'Admin',
    lastName: 'User',
    isAdmin: true,
    permissions: { full: true },
  },
  regularUser: {
    _id: new ObjectId('60d5f9d8f294e1c42e84f130'), // Example BSON ObjectId
    firstName: 'Regular',
    lastName: 'User',
    isAdmin: false,
    permissions: { full: false },
  },
  noAuthUser: null, // Represents an unauthenticated user state
};

// Mock cookies or session data
export const mockCookies = {
  adminCookie: `user=${encodeURIComponent(JSON.stringify(testUsers.adminUser))}`,
  regularCookie: `user=${encodeURIComponent(JSON.stringify(testUsers.regularUser))}`,
};
