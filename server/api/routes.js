import { Router } from 'express'

import users from './users'

export default () => {
	var routes = Router()

	routes.post('/users', users.create)
	
	return routes
}
