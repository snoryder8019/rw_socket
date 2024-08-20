import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import { config } from './config/config.js';
import { connect } from './plugins/mongo/mongo.js';
import indexRouter from './routes/index.js';
import adminRouter from './routes/admin.js';
import session from 'express-session';
import createError from 'http-errors';
import MongoStore from 'connect-mongo';
import noNos from './routes/securityFunctions/forbiddens.js';

const app = express();
const sessionMiddleware = session({
  secret: process.env.SESHID,
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: config.db_uri,
  }),
});
// Make sure to use this middleware with your app
app.use(sessionMiddleware);

// Make sure to replace "io" initialization with the shared session

app.use(noNos);
async function startApp() {
  // Connect to MongoDB first
  await connect();
  // Initialize Passport
  const { setupPassport, authRoutes } = require('./plugins/passport');
  setupPassport(app, process);
  app.use(flash());

  // Use auth routes
  app.use(authRoutes);

  global.config = config;

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.set('trust proxy', true);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  const cors = require('cors');
  const corsOptions = {
    origin: 'https://games.w2marketing.biz',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'user-id'],
    credentials: true,
  };
  // Configure CORS to allow requests from your main domain
  app.options('*', cors(corsOptions));
  app.use(cors(corsOptions));

  app.use('/', indexRouter);
  app.use('/admin', adminRouter);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
}

startApp();

export { app, sessionMiddleware };
