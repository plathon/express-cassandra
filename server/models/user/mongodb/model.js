import mongoose from 'mongoose'
import UserSchema from './schema'

let UserModel  = mongoose.model('User', UserSchema)
export default UserModel