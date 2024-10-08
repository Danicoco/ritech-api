const {
	DB_HOST,
	DB_NAME,
	DB_PASS,
	DB_USER,
	DB_PORT,
	TEST_DB_NAME
} = process.env;

module.exports = {
	development: {
		host: DB_HOST,
		port: DB_PORT,
		logging: false,
		username: DB_USER,
		password: DB_PASS,
		database: DB_NAME,
		dialect: 'postgres',
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false
			}
		},
		use_env_variable: false
	},
	test: {
		host: DB_HOST,
		port: DB_PORT,
		logging: false,
		username: DB_USER,
		password: DB_PASS,
		database: TEST_DB_NAME,
		dialect: 'postgres',
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false
			}
		},
		use_env_variable: false
	},
	staging: {
		host: DB_HOST,
		port: DB_PORT,
		logging: false,
		username: DB_USER,
		password: DB_PASS,
		database: DB_NAME,
		dialect: 'postgres',
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false
			}
		},
		pool: {
			min: 0,
			max: 100,
			acquire: 1000000
			// idle: 200000,
		},
		use_env_variable: false
	},
	production: {
		host: DB_HOST,
		port: DB_PORT,
		logging: false,
		username: DB_USER,
		password: DB_PASS,
		database: DB_NAME,
		dialect: 'postgres',
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false
			}
		},
		pool: {
			min: 0,
			max: 100,
			acquire: 1000000
			// idle: 200000,
			// @note https://github.com/sequelize/sequelize/issues/8133#issuecomment-359993057
		},
		use_env_variable: false
	}
};
