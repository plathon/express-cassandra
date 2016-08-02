import Joi from 'joi'

/**
* Export cassandra user schema validate
**/

let UserSchema = Joi.object().keys({
	name: Joi.string().min(3).max(45).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(3).max(45),
	facebook: Joi.string(),
	google: Joi.string(),
	twitter: Joi.string()
})

export default UserSchema