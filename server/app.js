var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var passConfig = require('./passport/config.js');


var app = express();
var io = require('socket.io')();
app.io = io;



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//mongoose
mongoose.connect('mongodb://ashish:freelancer12x01y@ds044699.mlab.com:44699/freelancer12x01y');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, '../client', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client')));
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(passConfig.serialize);
passport.deserializeUser(passConfig.deserialize);
passport.use('facebook', passConfig.facebookStrategy);

var routes = require('./routes/index');
var users = require('./routes/users');

app.use('/api/jobs', require('./routes/job')(io));

app.use('/api/users', users);

app.use('*', routes);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
module.exports = app;
