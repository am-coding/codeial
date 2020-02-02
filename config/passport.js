var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

module.exports = passport => {
    passport.use(
      new LocalStrategy((username, password, done) => {
        // match user
        User.findOne({ username: username })
          .then(user => {
            // username not matched
            if (!user) {
              console.log("username not found");
              return done(null, false, { message: 'No matching username found. Signup instead!' })
              
            }
  
            // compare password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                          if (err) throw err
                          console.log(password);
                          console.log(user.password);
              if (isMatch) {
                              // password matched, proceed to login
                return done(null, user)
              } else {
                return done(null, false, { message: 'Password incorrect' })
              }
            })
          })
          .catch(err => { throw err })
      })
    )
  
    // serialize user
    passport.serializeUser((user, done) => {
      console.log(user.id);
      done(null, user.id)
    })
    
    // deserialize user
    passport.deserializeUser((id, done) => {
      User.findById(id, (err, user) => {
        done(err, user)
      })
    })
  }