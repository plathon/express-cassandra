import cassandra from '../../database/cassandra'
import { encryptPassword, comparePassword } from './cassandra/helpers/password'
import UserSchema from './cassandra/schema'
import Joi from 'joi'
import async from 'async'
import jwt from './cassandra/helpers/jwt'
import uuid from 'node-uuid'
import slug from './cassandra/helpers/slug' 

export default {

	/**
	* description: create a new user
	* @param {object} - user
	* @param {function} - cb
	**/

	create: (user, cb) => {

		async.waterfall([

			/**
			* validate Schema
			**/

			function (callback) {
				Joi.validate(user, UserSchema, (err, res) => {
					if (err) return callback(err)
					return callback(null)
				})
			},

			/**
			* user already exists validation
			**/

			function (callback) {
				let query = 'SELECT COUNT (*) FROM users WHERE email = ? LIMIT 1'
				cassandra.execute(query, [ user.email ], [], (err, res) => {
					if (err) return callback(err)
					if (parseInt(res.rows[0].count)) return callback({
						status: false,
						label: 'USER_ALREADY_EXISTS',
						message: 'User already exists.'
					})
					callback(null)
				})
			},

			/**
			* formate data to insert 
			**/

			function (callback) {
				let timestamp = new Date().getTime()
				user.id = uuid.v1()

				let params = [
					user.id,
					user.name,
					user.name,
					user.email,
					user.password,
					timestamp,
					timestamp,
					1,
					null,
					null,
					null
				]

				callback(null, params)
			},

			/**
			* Generate Uniq slug to user
			**/

			function (params, callback) {

				slug.generate(params[1], (err, slugName) => {
					if (err) return callback(err)
					params[1] = slugName
					callback(null, params)
				})

			},

			/**
			* encrypt password
			**/

			function (params, callback) {
				
				encryptPassword(user.password, (err, password) => {
					if (err) return callback(err)
					params[4] = password
					callback(null, params)
				})
			},

			/**
			* create user
			**/

			function (params, callback) {
				let query = 'INSERT INTO users (id, slug, name, email, password, created_at, updated_at, status, facebook, google, twitter) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
				cassandra.execute(query, params, { prepare : true }, (err, res) => {
					if (err) return callback(err)
					return callback(null)
				})

			},

			/**
			* generate JWT
			**/

			function (callback) {

				jwt.generate(user, (err, token) => {
					if (err) return callback(err)
					return callback(null, token)
				})

			}

		], (err, token) => {

			if (err) return cb(err)
			return cb(null, token)

		})

	},

	/**
	* description: create or update a user authenticated with oauth
	* @param {object} 	- user
	* @param {string} 	- providerType
	* @param {function} - cb
	**/

	createOrUpdateUserOAuth: (user, providerType, cb) => {

		async.waterfall([

			/**
			* validate Schema
			**/

			function (callback) {

				Joi.validate(user, UserSchema, (err, res) => {
					if (err) return callback(err)
					return callback(null)
				})

			},

			/**
			* formate data base on oauth provider
			**/

			function (callback) {

				let timestamp = new Date().getTime()
				user.id = uuid.v1()

				let params = [
					user.id,
					user.name,
					user.name,
					user.email,
					null,
					timestamp,
					timestamp,
					1,
					(providerType) ? user.facebook : null,
					(providerType) ? user.google   : null,
					(providerType) ? user.twitter  : null,
				]

				callback(null, params)
			},

			/**
			* Generate Uniq slug to user
			**/

			function (params, callback) {

				slug.generate(params[1], (err, slugName) => {
					if (err) return callback(err)
					params[1] = slugName
					callback(null, params)
				})

			},

			/**
			* set provider to user
			**/

			function (params, callback) {

				let userExistsQuery = 'SELECT * FROM users WHERE email = ? LIMIT 1'
				cassandra.execute(userExistsQuery, [ user.email ], [], (err, res) => {
					if (err) return callback(err)

						//user dont exists yet
						let userProvider = res.rows[0] || null
						if (!userProvider) {
							let createUserQuery = 'INSERT INTO users (id, slug, name, email, password, created_at, updated_at, status, facebook, google, twitter) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
							cassandra.execute(createUserQuery, params, { prepare: true }, (err, res) => {
								if (err) return callback(err)
								return callback(null, params)
							})
							return
						}

						//user exists but dont have the especific provider
						if (userProvider && !userProvider[providerType]) {
							let query = `UPDATE users SET ${providerType} = ?, status = ? WHERE id = ?`
							cassandra.execute(query, [ user[providerType], 1, userProvider.id ], { prepare: true }, (err, res) => {
								if (err) return callback(err)
								return callback(null, params)
							})
							return
						}

						//user exists and have the provider
						if (userProvider && userProvider[providerType]) {
							return callback(null, params)
						}

					callback(null)
				})

			},


			/**
			* generate JWT
			**/

			function (params, callback) {

				jwt.generate(params, (err, token) => {
					if (err) return callback(err)
					return callback(null, token)
				})

			}


		], (err, token) => {

			if (err) return cb(err)
			return cb(null, {
				status: true,
				message: 'user successfully created',
				label: 'USER_SUCCESSFULLY_CREATED',
				data: { token: token } 
			})

		})

	},

	/**
	* description: generate a reset password hash to user and send a confirmation email
	* @param {string} - user
	* @param {string} - cb
	**/

	resetPassword: (email, cb) => {

		async.waterfall([

			/**
			* check user data
			**/

			function (callback) {

				let query = 'SELECT id, email FROM users WHERE email = ? LIMIT 1'

				cassandra.execute(query, [ email ], { prepare: true }, (err, res) => {
					if (err) return callback(err)
					let user = res.rows[0] || null
					if (!user) return callback({
						status: false,
						label: 'USER_NOT_FOUND',
						message: 'User not found'
					})
					callback(null, user)
				})

			},

			/**
			* fill database 'reset_password' field with uuid hash
			**/

			function (user, callback) {

				let hash  = uuid.v1()
				let query = 'UPDATE users SET reset_password = ? WHERE id = ?'

				cassandra.execute(query, [ hash, user.id ], { prepare: true }, (err, res) => {
					if (err) return callback(err)
					//send email to user here
					callback(null, {
						status: true,
						label: 'RESET_PASSWORD_INSTRUCTIONS_SENDED',
						message: 'Well send an email with instructions on how to reset your password to the email.',
						data: {
							hash: hash
						}
					})
				})

			}

		], (err, res) => {

			if (err) return cb(err)
			return cb(null, res)

			}
		)

	},

	/**
	* description: update user password
	* @param {string} 	- email
	* @param {string} 	- hash
	* @param {string} 	- newPassword
	* @param {function} - cb
	**/

	updatePassword: (email, hash, newPassword, cb) => {

		async.waterfall([

			/**
			* Select user data and compare has provider with database hash
			**/

			function (callback) {

				let query = 'SELECT id, email, reset_password FROM users WHERE email = ?'
				cassandra.execute(query, [ email ], { prepare: true }, (err, res) => {
					if (err) return callback(err)
					let user = res.rows[0] || null

					if (!user) return callback({
						status: false,
						label: 'USER_NOT_FOUND',
						message: 'User not found'
					})

					if (!user.reset_password || user.reset_password != hash) return callback({
						status: false,
						message: 'Unable to update the password.',
						label: 'UNABLE_TO_UPDATE_PASSWORD'
					})

					callback(null, )
				})

			},

			/**
			* encrypt and update password
			**/

			function (newPassword, callback) {

				encryptPassword(newPassword, (err, password) => {
					if (err) return callback(err)

					let query = 'UPDATE users SET password = ? WHERE id = ?'
					cassandra.execute(query, [ password, user.id ], { prepare: true }, (err, res) => {
						if (err) return callback(err)

						callback(null, {
							status: true,
							label: 'PASSWORD_SUCCESSFULLY_CHANGED',
							message: 'password successfully changed.'
						})
					})

				})

			}

			], (err, res) => {

				if (err) return cb(err)
				return cb(null, res)

			})

	}

}