import passport from 'passport'
import localStrategy from './strategies'

var passportConfig = localStrategy(passport)

export default passportConfig