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
	//facebook oAuth 2.0
	routes.get('/auth/facebook', passport.authenticate('facebook', { scope:['email'] }))
	routes.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), authentication.facebook)
	//google oAuth 2.0
	routes.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
	routes.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), authentication.google)

	return routes
}
