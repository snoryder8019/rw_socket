const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const bcrypt = require('bcrypt');
const { connect, getDb } = require('../mongo/mongo');  // assuming you're using the db.js you mentioned before
const env = require('dotenv').config();
const { ObjectId } = require('mongodb');
const YahooStrategy = require('passport-yahoo-oauth').Strategy;
const lib = require('../../routes/logFunctions/logFunctions')
passport.use(new YahooStrategy({
    consumerKey: process.env.YHO_CID,
    consumerSecret: process.env.YHO_SEC,
    callbackURL: "http://www.example.com/auth/yahoo/callback"
  },
  function(token, tokenSecret, profile, done) {
    User.findOrCreate({ yahooId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));




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
        console.log('awaiting email')
        const user = await users.findOne({ email });
      
               
     
        if (!user) {
          lib('login error: ', 'error: Email Not Found',  `Login Error:'email not found' , attempted email :${email} `,'errors.json','data')
          return done(null, false, {message:'Email not found, have you tried reigtering this email?'});
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {        
          lib('login error: ', 'error: Password Does Not Match',  `Login Error:'bad password' , attempted email :${email} `,'errors.json','data')
          return done(null, false, {message:'Incorrect Password, Please Try Again'});
        }  
        return done(null, user, {message:'Logged in successfully'});
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
          profileFields: ['id', 'displayName', 'photos', 'email', 'name']
        },
        async (accessToken, refreshToken, profile, done) => {
          const newUser = {
            providerID: profile.id,
            provider: 'facebook',
            email: profile.emails[0].value,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            password: '',
            isAdmin: false,
          };
          
      try {
        const db = getDb();
        const users = db.collection('users');
        let user = await users.findOne({ email: profile.emails[0].value });
        if (user) {
          done(null, user);
        } else {
          await users.insertOne(newUser);
          done(null, newUser);
        }
      } catch (err) {
        console.error(err);
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
          const newUser = {
            providerID: profile.id,
            provider: 'google',
            email: profile.emails[0].value,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            password: '',
            isAdmin: false,
            cart:[]
          };
          
          try {
            const db = getDb();
            const users = db.collection('users');
            let user = await users.findOne({ email: profile.emails[0].value });
            if (user) {
              done(null, user);
            } else {
              await users.insertOne(newUser);
              done(null, newUser);
            }
          } catch (err) {
            console.error(err);
          }
        }
        )
        );
        
        passport.serializeUser((user, done) => {
          // console.log('serialize')
          done(null, user._id);
        });
        
        passport.deserializeUser(async (id, done) => {
          try {
            // console.log('deserialize`')
            const db = getDb();
            const users = db.collection('users');
            const user = await users.findOne({ _id: new ObjectId(id)});
            
            done(null, user);
          } catch (err) {
            done(err);
          }
        });
        
       // lib('login error: ', 'error: Password Does Not Match',  `Login Error:'bad password' , attempted email :${email} `,'errors.txt')
        module.exports = passport;
        