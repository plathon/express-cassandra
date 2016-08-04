import jwt from 'jsonwebtoken'

export default {

	generate: (user, cb) => {
		let userData = { 
			id: user.id,
			name: user.name,
			email: user.email
		}
  		jwt.sign(userData, process.env.APP_SECRET, { expiresIn: 172800000 }, cb)
	}

}