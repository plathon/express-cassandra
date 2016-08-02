import UserModel from '../../models/user/cassandra/model'
import jwt from '../../models/user/cassandra/helpers/jwt'

export default {

	/**
	* description: authenticate user with local credentials
	* @param {string} email - user email
	* @param {string} password - user password
	**/

	authenticate: (req, res) => {
		let user = req.user
		jwt.generate(user, (err, token) => {
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

		UserModel.createOrUpdateUserOAuth({
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

		UserModel.createOrUpdateUserOAuth({
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