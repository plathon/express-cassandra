import bcrypt from 'bcrypt'

/**
* encrypt password provider with bcrypt
**/

function encryptPassword (password, cb) {
	bcrypt.genSalt(10, (err, salt) => {
	    if (err) return cb(err)
	    bcrypt.hash(password, salt, (err, hash) => {
	      if (err) return cb(err)
	      return cb(null, hash)
	    })
  	})
}

/**
* compare user password provider with hash
**/

function comparePassword (password, currentPassword, cb) {
	return bcrypt.compare(password, currentPassword, (err, res) => {
		if (err) return cb(err)
		return cb(null, res)
	})
}

export {
	encryptPassword,
	comparePassword
}