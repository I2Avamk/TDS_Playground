'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users.server.controller');

	// Setting up the users profile api
	app.route('/users/me').get(users.requiresLogin, users.me);
	app.route('/users').put(users.requiresLogin, users.update);
	app.route('/users/accounts').delete(users.removeOAuthProvider);

	// User management
	app.route('/users').get(users.requiresLogin, users.hasAuthorization, users.list); //users.hasAuthorization,
	app.route('/users/delete').put(users.requiresLogin, users.hasAuthorization, users.delete);
	app.route('/users/update').put(users.requiresLogin, users.hasAuthorization, users.manageUpdate);

	// Setting up the users password api
	app.route('/users/password').post(users.changePassword);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);


	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};