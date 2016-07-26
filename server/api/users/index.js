import UserModel from '../../models/user/mongodb/model'

export default {
	
	/**
	* description: create a new user
	* @param {string} name - user fullname
	* @param {string} email - user email
	* @param {string} password - user password
	**/

	create: (req, res) => {
		var params = req.body
		UserModel.findOne({ email: params.email }, (err, user) => {
			if (err) return res.status(401).send(err)
			if (user) return res.status(403).send({ message: 'User already exists.' })

			UserModel.create(params, (err, user) => {
				if (err) return res.status(500).send(err)

				user.generateJWT((err, token) => {
					if (err) return res.status(500).send(err)
					res.send({ token: token })
				})
			})
		})
	},

	list: (req, res) => {
		res.send('right')
	}

}