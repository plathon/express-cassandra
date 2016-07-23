import { Router } from 'express'

import users from './users'

export default () => {
	var routes = Router()

	routes.get('/users', users.list)
	
	return routes
}
