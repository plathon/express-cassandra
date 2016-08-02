import cassandra from '../../../database/cassandra'
import { encryptPassword, comparePassword } from './helpers/password'
import UserSchema from './schema'
import Joi from 'joi'
import async from 'async'
import jwt from './helpers/jwt'
import uuid from 'node-uuid'
import slug from 'slug'


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
					if (parseInt(res.rows[0].count)) return callback({ message: 'User already exists.' })
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
					slug(user.name),
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
				cassandra.execute(query, params, [], (err, res) => {
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
					slug(user.name),
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
							cassandra.execute(createUserQuery, params, [], (err, res) => {
								if (err) return callback(err)
								return callback(null, params)
							})
							return
						}

						//user exists but dont have the especific provider
						if (userProvider && !userProvider[providerType]) {
							let query = `UPDATE users SET ${providerType} = ? AND status = ? WHERE id = ?`
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
			return cb(null, { token: token })

		})

	}

}