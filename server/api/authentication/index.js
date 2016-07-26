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
	}
}