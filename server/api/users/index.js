import UserModel from '../../models/user/cassandra/model'

export default {
	
	/**
	* description: create a new user
	* @param {string} name - user fullname
	* @param {string} email - user email
	* @param {string} password - user password
	**/

	create: (req, res) => {

		let params = req.body
		UserModel.create(params, (err, token) => {
			if (err) return res.status(401).send(err)
			res.send({ token: token })
		})

	},

}