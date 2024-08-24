import setupPassport from './setup.js';
import { authRouter } from './auth.js';
import { createUser } from './localStrat.js';

export { setupPassport, authRouter, createUser };
