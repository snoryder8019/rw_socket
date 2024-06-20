var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const config = require('./config/config');
var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
const session = require('express-session');
const env = require('dotenv').config();
const { connect } = require('./plugins/mongo/mongo');
const createError = require('http-errors');
const MongoStore = require('connect-mongo');
const expressSession = require('express-session')
const {exporterRoute} = require('./plugins/puppeteer/setup');
const noNos = require('./routes/securityFunctions/forbiddens');
var app = express();
const sessionMiddleware = session({
  secret: process.env.SESHID,
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
      mongoUrl:"mongodb+srv://"+process.env.MONUSR+":"+encodeURIComponent(process.env.MONPASS)+config.DB_URL+config.DB_NAME+"?retryWrites=true&w=majority"
  })
});

// Make sure to use this middleware with your app
app.use(sessionMiddleware);

// Make sure to replace "io" initialization with the shared session



app.use(noNos)
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
    credentials: true 
  }
  // Configure CORS to allow requests from your main domain
  app.options("*",cors(corsOptions))
  app.use(cors(corsOptions));
 
  app.use('/', indexRouter);
  app.use('/admin', adminRouter);
  app.use('/', exporterRoute);
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
}

startApp();

module.exports = {app, sessionMiddleware};
