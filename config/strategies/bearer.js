'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	BearerStrategy = require('passport-http-bearer').Strategy,
	jwt = require('jsonwebtoken');
var apiSecret = 'supersecret';

module.exports = function() {
	// Use local strategy
	passport.use(new BearerStrategy( function(token, done) {
		jwt.verify(token, apiSecret, function(err, decoded) {      
	      if (err) {
	        return done(null, false, {
	        	message:err.name
	        });    
	      } else {
	        // if everything is good, save to request for use in other routes
	        // req.decoded = decoded;
	        
	        /*Attach decoded user info in req.user*/    
	        return done(null, decoded);
	      }
		});

		}
	));
};