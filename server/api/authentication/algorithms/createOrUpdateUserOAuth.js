import UserModel from '../../../models/user/mongodb/model'

/**
* description: create or update a user authenticate with oauth
* @param {object} 	- user
* @param {string} 	- providerType
* @param {function} - cb
**/

export default (newUser, providerType, cb) => {

	UserModel.findOne({ email: newUser.email }, (err, user) => {
		if (err) return cb(err)

		//user already exists and has facebook provider
		if (user && user[providerType] && newUser[providerType] === user[providerType]) {
			user.generateJWT((err, token) => {
				if (err) return cb(err)
				cb(null, { token: token })
			})
			return
		}

		//update a already existent user with facebook provider
		if (user && !user[providerType]) {
			let updateData = {}
			updateData[providerType] = newUser[providerType]
			UserModel.update({ _id: user._id }, { $set: updateData }, (err) => {
				if (err) return cb(err)
				user.generateJWT((err, token) => {
					if (err) return cb(err)
					cb(null, { token: token })
				})
			})
			return
		}

		//or create a new user with facebook provider
		let updateData 			 = {}
		updateData[providerType] = newUser[providerType]
		updateData.name 		 = newUser.name
		updateData.email 		 = newUser.email
		UserModel.create(updateData, (err, user) => {
			if (err) return cb(err)
			user.generateJWT((err, token) => {
				if (err) return cb(err)
				cb(null, { token: token })
			})
		})
	})

}