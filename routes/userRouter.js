const express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/users');

const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

const userRouter = express.Router();

userRouter.use(bodyParser.json());

userRouter.options('*', cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
});

userRouter.post('/signup', cors.corsWithOptions, (req, res, next) => {
  User.register(new User({
    username: req.body.username
  }), req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        err: err
      });
    } else {
      if (req.body.firstname) user.firstname = req.body.firstname;
      if (req.body.lastname) user.lastname = req.body.lastname;

      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({
            err: err
          });
          return;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({
            success: true,
            status: 'Registration Successful'
          });
        });
      });
    }
  });
});

userRouter.post('/login', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: false,
        status: 'Login Unsuccessful',
        err: info
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          success: false,
          status: 'Login Unsuccessful',
          err: 'Could not log in user'
        });
      }

      var token = authenticate.getToken({
        _id: req.user._id
      });

      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        token: token,
        status: 'Login successful'
      });
    });
  })(req, res, next);
});

userRouter.get('/logout', cors.corsWithOptions, (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

userRouter.get('/checkJWTToken', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('jwt', {
    session: false
  }, (err, user, info) => {
    if (err) next(err);
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        status: 'JWT Invalid!',
        success: false,
        err: info
      });
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        status: 'JWT valid!',
        success: true,
        user: user
      });
    }
  })(req, res);
});

module.exports = userRouter;
