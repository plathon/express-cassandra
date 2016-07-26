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
	routes.post('/users/auth', passport.authenticate('local'), authentication.authenticate)
	
	return routes
}
