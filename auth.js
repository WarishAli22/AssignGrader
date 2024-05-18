const passport = require('passport');
const mongoose = require('mongoose');
const findOrCreate = require("mongoose-findorcreate");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require("dotenv").config();
const User = require('./models/Instructor');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/google/callback"
  },

  function(accessToken, refreshToken, profile, cb) {
    profile.tokens = { access_token: accessToken, refresh_token: refreshToken };
    return cb(null, profile);
  }

));

passport.serializeUser(function(user,cb){
  cb(null,user);
});

passport.deserializeUser(function(user,cb){
  cb(null,user);
});



