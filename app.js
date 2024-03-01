const env = require('dotenv').config();
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
const { connect } = require('./plugins/mongo/mongo');
const createError = require('http-errors');
const MongoStore = require('connect-mongo');

const {exporterRoute} = require('./plugins/puppeteer/setup');
const noNos = require('./routes/securityFunctions/forbiddens');
var app = express();

// Initialize session with your settings
const expressSession = session({
    secret: 'your_secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ 
      mongoUrl: "mongodb+srv://"+process.env.MONUSR+":"+encodeURIComponent(process.env.MONPASS)+"@royalcluster.sda0nl3.mongodb.net/"+config.DB_NAME+"?retryWrites=true&w=majority"

     })
});

// Use shared session middleware for Express and Socket.IO
app.use(expressSession);

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
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));


 
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

module.exports = app;
