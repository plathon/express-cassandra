import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as OAuth2Strategy } from 'passport-oauth2'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

import UserModel from '../../models/user/mongodb/model'

export default (passport) => {

	/**
	* passport LocalStrategy
	**/
	
	passport.use(new LocalStrategy({
		usernameField: 'email',
		session: false
	}, (email, password, done) => {
	    	UserModel.findOne({ email: email }, (err, user) => {
		     	if (err) return done(err)
		      	if (!user) return done(null, false)
		      	if (!user.comparePassword(password)) return done(null, false)
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
			UserModel.findOne({ _id: payload._id }, (err, user) => {
				if (err) return done(err)
		      	if (!user) return done(null, false)
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