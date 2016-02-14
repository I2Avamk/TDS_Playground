'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;
	delete req.body._id;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.json(req.user || null);
};

/*Delete an user*/
exports.delete = function(req, res) {
	User.findOne({
		_id: req.body.id
	}).exec(function(err, user) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			
			//Only allowed superadmin delete admin
			if (_.intersection(user.roles, ['admin']).length > 0) {
				if(_.intersection(req.user.roles, ['superadmin']).length <= 0)
					return res.status(403).send('User is not authorized');
			}

			user.remove(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.status(200).send();
				}
			});
		}
	});
	
};

/*Update an user*/
exports.manageUpdate = function(req, res) {
	console.log(req.body);
	User.findOne({
		_id: req.body._id
	}).exec(function(err, user) {
		if(!user)
			return res.status(400).send({
				message: 'User not found'
			});
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// Init Variables
			var message = null;

			// For security measurement we remove the roles from the req.body object
			// delete req.body.roles;
			delete req.body._id;
			delete req.body.password;
			delete req.body.salt;

			//Only allowed superadmin update/assign admin
			if (_.intersection(user.roles, ['admin']).length > 0 || _.intersection(req.body.roles, ['admin']).length > 0) {
				if(_.intersection(req.user.roles, ['superadmin']).length <= 0)
					return res.status(403).send('User is not authorized');
			}
			// Merge existing user
			user = _.extend(user, req.body);
			user.updated = Date.now();
			user.displayName = user.firstName + ' ' + user.lastName;

			user.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					return res.status(200).send(user);
				}
			});


		}
	});
	
};

/*List users*/
exports.list = function(req, res) {
	User.find({},'_id displayName email roles phone address firstName lastName').sort('created').exec(function(err, reasons) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(reasons || null);
		}
	});
};