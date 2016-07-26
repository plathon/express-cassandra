import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import morgan from 'morgan'

import './config/environment'
import'./database/mongodb'

import passport from './config/passport'
import middleware from './middleware'

import api from './api/routes'

var app = express()

// 3rd party middleware
app.use(cors())
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit : '100kb' }))
app.use(morgan('combined'))
app.use(passport.initialize())

// internal middleware
app.use(middleware())

// api router
app.use('/', api())

app.listen(3000)

export default app