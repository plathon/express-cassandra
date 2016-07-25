import localStrategy from 'passport-local'
import UserModel from '../../models/user/mongodb/model'

var LocalStrategy = localStrategy.Strategy

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
		      	console.log(user)
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