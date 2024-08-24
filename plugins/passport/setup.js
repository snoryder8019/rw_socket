import { config } from '../../config/config.js';
import passport from './passport.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';

export default function (app, process) {
  // app.use(session({
  //     secret: process.env.SESHID,
  //    // resave: false,
  //   //  saveUninitialized: false,
  //    resave: false,
  //    saveUninitialized: true,
  //     cookie: {
  //         secure: false
  //     },
  //     store: new MongoStore({
  //         mongoUrl: "mongodb+srv://"+process.env.MONUSR+":"+encodeURIComponent(process.env.MONPASS)+"@royalcluster.sda0nl3.mongodb.net/"+config.DB_NAME+"?retryWrites=true&w=majority"
  //     }),

  // }));

  app.use(passport.initialize());
  app.use(passport.session());
}
