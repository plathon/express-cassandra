import UserModel from '../../models/user/mongodb/model'

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

		UserModel.findOne({ email: email }, (err, user) => {
			if (err) return res.status(401).send(err)
			//User already exists
			if (user) {

				user.generateJWT((err, token) => {
					if (err) return res.status(500).send(err)
					res.send({ token: token })
				})

			} else {
				//or create a new user
				UserModel.create({
					name: fullName,
					email: email,
					facebook: facebookId
				}, (err, user) => {
					if (err) return res.status(500).send(err)
					user.generateJWT((err, token) => {
						if (err) return res.status(500).send(err)
						res.send({ token: token })
					})
				})
			}

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

		UserModel.findOne({ email: email }, (err, user) => {
			if (err) return res.status(401).send(err)
			//User already exists
			if (user) {

				user.generateJWT((err, token) => {
					if (err) return res.status(500).send(err)
					res.send({ token: token })
				})

			} else {
				//create a new user
				UserModel.create({
					name: fullName,
					email: email,
					google: googleId
				}, (err, user) => {
					if (err) return res.status(500).send(err)
					user.generateJWT((err, token) => {
						if (err) return res.status(500).send(err)
						res.send({ token: token })
					})
				})
			}
		})
	}

}