import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import morgan from 'morgan'

import database from './database'
import middleware from './middleware'

import api from './api/routes'

var app = express()

// 3rd party middleware
app.use(cors())
app.use(bodyParser.json({ limit : '100kb' }))
app.use(helmet())

// internal middleware
app.use(middleware())
app.use(morgan('combined'))

// api router
app.use('/', api())

app.listen(3000)

export default app