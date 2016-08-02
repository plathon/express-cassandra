import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

import { comparePassword } from '../../models/user/cassandra/helpers/password'
import Cassandra from '../../database/cassandra'
import async from 'async'

export default (passport) => {

	/**
	* passport LocalStrategy
	**/
	
	passport.use(new LocalStrategy({
		usernameField: 'email',
		session: false
	}, (email, password, done) => {

			async.waterfall([

				/**
				* check user exists and get user (email, password) by email
				**/

				function (callback) {
					let query = 'SELECT * FROM users WHERE email = ? LIMIT 1'
					Cassandra.execute(query, [ email ], [], (err, res) => {
						if (err) return callback(err)
						let user = (res.rows[0]) ? res.rows[0] : null
						if (!user) return callback({ message: 'User not found.' })
						callback(null, user)
					})

				},

				/**
				* validate password provider
				**/

				function (user, callback) {
					comparePassword(password, user.password, (err, res) => {
						if (err) return callback(err)
						if (!res) return callback({ message: 'Email and password not match.' })
						return callback(null, user)
					})
				}

			], (err, user) => {

				if (err) return done(err)
				return done(null, user)

			})

	  	}
	))

	/**
	* passport JwtStrategy
	**/

	passport.use(new JwtStrategy({
		jwtFromRequest: ExtractJwt.fromAuthHeader(),
		secretOrKey: process.env.APP_SECRET,
	}, (payload, done) => {
			let query = 'SELECT * FROM users WHERE id = ? LIMIT 1'
			Cassandra.execute(query, [ payload.id ], [], (err, res) => {
				if (err) return done(err)
				let user = res.rows[0]
				if (!res) return done(null, false) 
				return done(null, user)
			})
		}
	))

	/**
	* passport FacebookStrategy
	**/

	passport.use(new FacebookStrategy({
	    clientID: process.env.FACEBOOK_APP_ID,
	    clientSecret: process.env.FACEBOOK_SECRET,
	    callbackURL: process.env.FACEBOOK_CALLBACK,
	    profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
	}, (accessToken, refreshToken, profile, cb) => {
	    	return cb(null, profile)
	  	}
	))

	/**
	* passport GoogleStrategy
	**/

	passport.use(new GoogleStrategy({
	    clientID: process.env.GOOGLE_CLIENT_ID,
	    clientSecret: process.env.GOOGLE_SECRET,
	    callbackURL: process.env.GOOGLE_CALLBACK
	 }, (token, tokenSecret, profile, cb) => {
	    	return cb(null, profile)
		}
	))

	/**
	* passport serialize middleware
	**/

	passport.serializeUser(function(user, done) {
	  done(null, user)
	})

	/**
	* passport deserialize middleware
	**/

	passport.deserializeUser(function(user, done) {
	  done(null, user)
	})
		
	return passport
}