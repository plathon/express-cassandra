import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

import UserModel from '../../models/user/mongodb/model'

export default (passport) => {

	/**
	* passport LocalStrategy
	**/
	
	passport.use(new LocalStrategy(
		{
			usernameField: 'email',
			session: false
		},
	  	(email, password, done) => {
	    	UserModel.findOne({ email: email }, function (err, user) {
		     	if (err) return done(err)
		      	if (!user) return done(null, false)
		      	if (!user.comparePassword(password)) return done(null, false)
		      	return done(null, user)
	    })
	  }
	))

	/**
	* passport JWTStrategy
	**/

	passport.use(new JwtStrategy({
		jwtFromRequest: ExtractJwt.fromAuthHeader(),
		secretOrKey: process.env.APP_SECRET
	}, (payload, done) => {
			UserModel.findOne({ _id: payload._id }, (err, user) => {
				if (err) return done(err)
		      	if (!user) return done(null, false)
		      	return done(null, user)
			})
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