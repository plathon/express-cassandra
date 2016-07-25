import { Router } from 'express'
import passport from '../config/passport'

import users from './users'

export default () => {
	var routes = Router()

	routes.post('/users', users.create)
	routes.post('/users/auth', passport.authenticate('local'), users.auth)
	
	return routes
}
