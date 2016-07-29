import mongoose   from 'mongoose'
import timestamps from 'mongoose-timestamp'
import bcrypt     from 'bcrypt'
import slug       from 'mongoose-slug'
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
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [ 4, 'Very short email' ],
    maxlength: [ 64, 'Very long email' ]
  },
  password: {
    type: String,
    minlength: [ 3, 'Very short password' ],
    maxlength: [ 64, 'Very long password' ]
  },
  facebook: { type: String },
  google: { type: String }
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

UserSchema.methods.generateJWT = function (cb) {
  let userData = { _id: this._id, name: this.name, email: this.email }
  jwt.sign(userData, process.env.APP_SECRET, { expiresIn: 172800000 }, cb)
}

/**
* Timestamps plugin to mongoose
**/

UserSchema.plugin(timestamps)

/**
* slug plugin to mongoose
**/

UserSchema.plugin( slug('name') )

/**
* Export schema
**/

export default UserSchema