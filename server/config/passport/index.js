import passport from 'passport'
import strategies from './strategies'

var passportConfig = strategies(passport)

export default passportConfig