var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

mongoose.connect(process.env.MONGOURI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongo connection error:'));

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');

const corsOpt = {
  allowHeaders: ['Content-Type', 'application/json'],
  preflightContinue: 'true',
};

var app = express();
app.options('*', cors(corsOpt));

// view engine setup
// app.use(function (req, res, next) {
//   req.headers['content-type'] = 'application/json';
//   next();
// });
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors(corsOpt));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/posts/:postid/comments', commentsRouter);

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

module.exports = app;
