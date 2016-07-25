import mongoose   from 'mongoose'
import timestamps from 'mongoose-timestamp'
import bcrypt     from 'bcrypt'
import jwt        from 'jsonwebtoken'

var Schema = mongoose.Schema

/**
* User Database Schema
**/

var UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: [ 3, 'Very short name' ],
    maxlength: [ 64, 'Very long name' ]
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    minlength: [ 4, 'Very short email' ],
    maxlength: [ 64, 'Very long email' ]
  },
  password: {
    type: String,
    minlength: [ 3, 'Very short password' ],
    maxlength: [ 64, 'Very long password' ]
  }
})

/**
* Password crypt middleware
**/

UserSchema.pre('save', function (next) {
  var user = this;
  if (!user.isModified('password')) return next()
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err)
      user.password = hash
      return next()
    })
  })
})

/**
* Compare password method
**/

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

/**
* Generate JWT
**/

UserSchema.methods.generateJWT = (user, cb) => {
  let userData = { _id: user._id, name: user.name, email: user.email }
  jwt.sign(userData, process.env.APP_SECRET, { expiresIn: 172800000 }, cb)
}

/**
* Timestamps plugin
**/

UserSchema.plugin(timestamps)

/**
* Export schema
**/

export default UserSchema