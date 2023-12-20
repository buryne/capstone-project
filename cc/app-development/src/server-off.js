const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const morgan = require('morgan')
const passport = require('passport')
const session = require('express-session')
const routerUser = require('./routes/router-user')
const routerPost = require('./routes/router-post-off')
const { isLoggedIn } = require('./middleware/authMiddleware')
require('./utils/auth')

const app = express()
const PORT = process.env.PORT || 5000
dotenv.config()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(session({ secret: process.env.SECRET, saveUninitialized: true, resave: true }))
app.use(passport.initialize())
app.use(passport.session({ pauseStream: true }))


app.use('/api/v1/users', routerUser)
app.use('/api/v1/posts', isLoggedIn, routerPost)

app.use((req, res, next) => {
  res.header('Jelajah-Nusantara', 'Jelajah Nusantara API')
  next()
})

app.get('/', async (req, res) => {
  try {
    res.status(200).json({ message: 'Jelajah Nusantara API is active' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/auth/google/failure',
  }),
)

app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..')
})


app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

app.all('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 404,
      message: 'Endpoint not found. Please contact the developer for assistance.',
    },
  })
})

app.listen(PORT, () => {
  console.log(`[⚡ server] Listening on url http://localhost:${PORT}`)
})
