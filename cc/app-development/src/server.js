const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const morgan = require('morgan')
// ! OFF
// const path = require('path')
const passport = require('passport')
const session = require('express-session')
const routerUser = require('./routes/router-user')
const routerPost = require('./routes/router-post')
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

// ! OFF
// app.set('view engine', 'ejs')
// app.set('views', path.join(__dirname, 'views'))

app.use('/api/v1/users', routerUser)
app.use('/api/v1/posts', isLoggedIn, routerPost)

// ! OFF FEATURE
// const isLoggedIn = asyncHandler(async (req, res, next) => {
//   if (req.isAuthenticated()) {
//     // Continue to the next middleware if the user is authenticated
//     return next()
//   }
//   // Render the index page with authentication status
//   return res.render('index', { isAuthenticated: false })
// })

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

// ! OFF FEATURE
// app.get('/profile', isLoggedIn, (req, res) => {
//   const username = req.user.displayName

//   res.render('profile', { username })
// })

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
