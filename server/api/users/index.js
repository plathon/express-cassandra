import UserModel from '../../models/user'

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

	/**
	* description: generate a reset password hash and send a confirmation email to user
	* @param {string} email - user email
	**/

	resetPassword: (req, res) => {
		let { email } = req.body
		UserModel.resetPassword(email, (err, hash) => {
			if (err) return res.status(500).send(err)
			res.send(hash)
		})
	},

	/**
	* description: update user password
	* @param {string} - email
	* @param {string} - hash
	* @param {string} - newPassword
	**/

	updatePassword: (req, res) => {
		let { email, hash, newPassword } = req.body
		UserModel.updatePassword(email, hash, newPassword, (err, status) => {
			if (err) return res.status(500).send(err)
			res.send(status)
		})
	}

}