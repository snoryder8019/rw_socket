import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import LocalStrategy from 'passport-local';
import FacebookStrategy from 'passport-facebook';
import bcrypt from 'bcrypt';
import { getDb } from '../mongo/mongo.js';
import { ObjectId } from 'mongodb';
import Permission from '../mongo/models/Permission.js';

// Adjusted newUser function for creating or retrieving user
export const newUser = async (profile, provider) => {
  const db = getDb();
  const users = db.collection('users');

  // Check if the user already exists
  let user = await users.findOne({ email: profile.emails[0].value });
  if (user) {
    return user; // User already exists, return existing user
  }

  // User doesn't exist, create new user object
  user = {
    providerID: profile.id,
    provider: provider,
    email: profile.emails[0].value,
    displayName: profile.displayName,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    password: '',
    isAdmin: false,
    gems: { type: 'number', value: 25 },

    cart: [],
    notifications: [],
    images: [{ thumbnailUrl: '/images/hugeIcon.png', avatarTag: true }],
    clubs: [],
    subscription: 'free',
    permissions: new Permission().modelFields, // Stamp permissions using the Permission model
    wallet: {
      emerald: 0,
      sapphire: 0,
      amethyst: 0,
    },
  };

  // Insert the new user into the database
  const result = await users.insertOne(user);
  user._id = result.insertedId; // Assign the new MongoDB _id to the user object

  return user; // Return the new user with _id
};

// passport.use(new YahooStrategy({
//     consumerKey: process.env.YHO_CID,
//     consumerSecret: process.env.YHO_SEC,
//     callbackURL: "http://www.example.com/auth/yahoo/callback"
//   },
//   async (token, tokenSecret, profile, done) => {
//     try {
//       const user = await newUser(profile, 'yahoo');
//       done(null, user);
//     } catch (err) {
//       console.error(err);
//       done(err, null);
//     }
//   }
// ));

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passReqToCallback: true, // Enables the request object in the callback
    },
    async (req, email, password, done) => {
      try {
        const db = getDb();
        const users = db.collection('users');
        console.log('awaiting email');
        const user = await users.findOne({ email });

        if (!user) {
      
          return done(null, false, {
            message: 'Email not found, have you tried registering this email?',
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
      
          return done(null, false, {
            message: 'Incorrect Password, Please Try Again',
          });
        }
        return done(null, user, { message: 'Logged in successfully' });
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FBCID,
      clientSecret: process.env.FBSEC,
      callbackURL: '/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email', 'name'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await newUser(profile, 'facebook');
        done(null, user);
      } catch (err) {
        console.error(err);
        done(err, null);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GGLCID,
      clientSecret: process.env.GGLSEC,
      callbackURL: '/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await newUser(profile, 'google');
        done(null, user);
      } catch (err) {
        console.error(err);
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = getDb();
    const users = db.collection('users');
    const user = await users.findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
