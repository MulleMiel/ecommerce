const express = require('express');
const router = express.Router();

const AuthService = require('../services/AuthService');
const authServiceInstance = new AuthService();

module.exports = (app, passport) => {

  app.use('/auth', router);

  // SESSION

  router.get('/current-session',
  function(req, res) {
    if(req.isAuthenticated()) return res.status(200).json(req.user);
    res.sendStatus(401);
  });

  // LOCAL AUTH
  
  router.post('/login', isNotAuthMiddleware,
  passport.authenticate('local'),
  function(req, res) {
    if(req.isAuthenticated()) return res.status(200).json(req.user);
    res.sendStatus(401);
  });

  router.delete('/logout', isAuthMiddleware, function(req, res) {
    req.logout();
    res.redirect('/');
  });

  router.post('/register', isNotAuthMiddleware, function(req, res) {
    if(!req.body.email || !req.body.password){
      return res.sendStatus(400);
    }
    authServiceInstance.register(req.body, (error, user) => {
      if(error) return res.sendStatus(500);
      if(!user) return res.sendStatus(409);
      res.sendStatus(200);
    });
  });

  // GOOGLE AUTH

  router.get('/google', 
  passport.authenticate('google', {
    scope: [ 'email', 'profile' ]
  }));

  router.get('/google/callback',
  passport.authenticate('google'),
  function(req, res) {
    if(req.isAuthenticated()) return res.redirect('/');
    res.redirect('/error');
  });

  // FACEBOOK AUTH

  router.get('/facebook',
  passport.authenticate('facebook', { 
    scope: ['email'] 
  }));

  router.get('/facebook/callback',
  passport.authenticate('facebook'),
  function(req, res) {
    if(req.isAuthenticated()) return res.redirect('/');
    res.redirect('/error');
  });
}

function isAuthMiddleware(req, res, next) {
  if(!req.isAuthenticated()){
    return res.sendStatus(401);
  }
  next();
}

function isNotAuthMiddleware(req, res, next) {
  if(!req.isAuthenticated()){
    return next();
  }
  res.sendStatus(403);
}

module.exports.isAuthMiddleware = isAuthMiddleware;
module.exports.isNotAuthMiddleware = isNotAuthMiddleware;