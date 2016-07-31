import UserModel from '../../models/user/mongodb/model'
import createOrUpdateUserOAuth from './algorithms/createOrUpdateUserOAuth'

export default {

	/**
	* description: authenticate user
	* @param {string} email - user email
	* @param {string} password - user password
	**/

	authenticate: (req, res) => {
		let user = req.user
		user.generateJWT((err, token) => {
			if (err) return res.status(401).send(err)
			res.send({ token: token })
		})
	},

	/**
	* description: facebook oauth 2.0
	**/

	facebook: (req, res) => {

		let params 	   = req.user
		let facebookId = params.id
		let email 	   = params.emails[0].value
		let fullName   = `${params.name.givenName} ${params.name.familyName}`

		createOrUpdateUserOAuth({
			name: fullName,
			email: email,
			facebook: facebookId
		}, 
		'facebook',
		(err, token) => {
			if (err) return res.status(401).send(err)
			res.send(token)
		})

	},

	/**
	* description: google oauth 2.0
	**/

	google: (req, res) => {

		let params 	 = req.user
		let googleId = params.id
		let email    = params.emails[0].value
		let fullName = params.displayName

		createOrUpdateUserOAuth({
			name: fullName,
			email: email,
			google: googleId
		},
		'google',
		(err, token) => {
			if (err) return res.status(500).send(err)
			res.send(token)
		})

	}

}