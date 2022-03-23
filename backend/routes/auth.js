const express = require('express');
const router = express.Router();

const AuthService = require('../services/AuthService');
const authServiceInstance = new AuthService();

module.exports = (app, passport) => {

  app.use('/auth', router);

  router.get('/current-session',
  function(req, res) {
    if(req.isAuthenticated()) return res.status(200).json(req.user);
    res.sendStatus(401);
  });
  
  router.post('/login', isNotAuthMiddleware,
  passport.authenticate('local'),
  function(req, res) {
    if(req.isAuthenticated()) return res.status(200).json(req.user);
    res.sendStatus(401);
  });

  router.delete('/logout', isAuthMiddleware, function(req, res) {
    req.logout();
    res.status(200).send(true);
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



  router.get('/google', passport.authenticate('google', {
    scope: [ 'email', 'profile' ]
  }));

  router.get('/google/callback',
  passport.authenticate('google'),
  function(req, res) {
    if(req.isAuthenticated()) return res.status(200).json(req.user);
    res.sendStatus(401);
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