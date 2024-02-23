// plugins/passport/setup.js
const config = require('../../config/config')
const passport = require('./passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');


module.exports = function(app, process) {
    app.use(session({
        secret: process.env.SESHID,
       // resave: false,
      //  saveUninitialized: false,
       resave: false,
       saveUninitialized: true,
        cookie: {
            secure: false
        },
        store: new MongoStore({
            mongoUrl: "mongodb+srv://"+process.env.MONUSR+":"+encodeURIComponent(process.env.MONPASS)+"@royalcluster.sda0nl3.mongodb.net/"+config.DB_NAME+"?retryWrites=true&w=majority"
        }),
  
    }));

    app.use(passport.initialize());
    app.use(passport.session());
};


