import { Router } from 'express'
import passport from '../config/passport'

import users from './users'
import authentication from './authentication'

export default () => {
	var routes = Router()

	//users
	routes.post('/users', users.create)
	routes.get('/users', passport.authenticate('jwt', { session: false }), users.list)

	//authetication
	routes.post('/auth/auth', passport.authenticate('local'), authentication.authenticate)
	routes.get('/auth/facebook', passport.authenticate('facebook', { scope:['email'] }))
	routes.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), authentication.facebook)
	routes.get('/auth/twitter', passport.authenticate('twitter', {session: false}))
	routes.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), authentication.twitter)

	return routes
}
