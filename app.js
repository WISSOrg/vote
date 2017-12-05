var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieSession = require('cookie-session')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var expressMongoDb = require('express-mongo-db');

var config = require('./config/config.json');
var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine (pug)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// logger
app.use(logger('dev'));

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// cookie session 
app.use(cookieSession({
  name: 'vote',
  keys: config.cookieKeys,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
}));
app.use((req, res, next)=>{
  if (!req.session || !req.session.user) {
    res.locals.user = null;
  }
  res.locals.user = req.session.user;
  next();
});

// cookie parser
app.use(cookieParser());

// sass
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));

// static files
app.use(express.static(path.join(__dirname, 'public')));

// mongodb
app.use(expressMongoDb(config.mongoConnectionString));

// routers
app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

module.exports = app;
