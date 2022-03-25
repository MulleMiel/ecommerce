const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const UserModel = require('../models/user');
const UserModelInstance = new UserModel();

const AuthService = require('../services/AuthService');
const authServiceInstance = new AuthService();

const { OAUTH2 } = require('../config');

module.exports = (app) => {

  // Initialize passport
  app.use(passport.initialize());  
  app.use(passport.session());

  // Set method to serialize data to store in cookie
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // Set method to deserialize data stored in cookie and attach to req.user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserModelInstance.findOneById(id);
      if (!user) return done(null, false);
      done(null, { 
        id: user.id, 
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname
      });
    } catch (error) {
      done(error);
    }
  });

  passport.use(new LocalStrategy({ usernameField: "email"}, authServiceInstance.login));

  passport.use(new GoogleStrategy({
    clientID: OAUTH2.GOOGLE.CLIENT_ID,
    clientSecret: OAUTH2.GOOGLE.CLIENT_SECRET,
    callbackURL: OAUTH2.GOOGLE.CALLBACK_URL,
    passReqToCallback: true
  }, async function(request, accessToken, refreshToken, profile, done) {

      try {
        const existingUser = await UserModelInstance.findOneByEmail(profile.email);
        
        if(existingUser){
          return done(null, existingUser);
        }
      
        const data = {
          email: profile.email,
          firstname: profile.name.givenName,
          lastname: profile.name.familyName,
          google: true
        }
        const newUser = await UserModelInstance.create(data);
        if(newUser){
          return done(null, newUser);
        }
        done("Something went wrong.", null);
      } catch (error){
        done(error, null);
      }
    }
  ));

  passport.use(new FacebookStrategy({
    clientID: OAUTH2.FACEBOOK.CLIENT_ID,
    clientSecret: OAUTH2.FACEBOOK.CLIENT_SECRET,
    callbackURL: OAUTH2.FACEBOOK.CALLBACK_URL,
    profileFields: ['id', 'displayName', 'email']
  }, async function(accessToken, refreshToken, profile, done) {

      try {
        const existingUser = await UserModelInstance.findOneByEmail(profile.email);
        
        if(existingUser){
          return done(null, existingUser);
        }
      
        const data = {
          email: profile.emails[0].value,
          firstname: profile.name.givenName || profile.displayName,
          lastname: profile.name.familyName,
          facebook: true
        }
        const newUser = await UserModelInstance.create(data);
        if(newUser){
          return done(null, newUser);
        }
        done("Something went wrong.", null);
      } catch (error){
        done(error, null);
      }
    }
  ));

  return passport;
}