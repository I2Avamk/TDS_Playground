'use strict';

module.exports = {
	db: 'mongodb://localhost/tds-dev',
	app: {
		title: 'I2A - Development Environment'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'I2A Development Team',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
			auth: {
				user: process.env.MAILER_EMAIL_ID,
				pass: process.env.MAILER_PASSWORD
			}
		}
	}
};
