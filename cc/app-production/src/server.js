const express = require('express')
const cors = require('cors')
const path = require('path')
const dotenv = require('dotenv')
const morgan = require('morgan')
const passport = require('passport')
const session = require('express-session')
const routerUser = require('./routes/router-user')
const routerPost = require('./routes/router-post')
const googleAuthRoutes = require('./routes/google-auth-routes')
const ejsRouterPost = require('./routes/router-post-ejs')
const ejsRouterUser = require('./routes/router-user-ejs')
const { registerUser } = require('./controllers/controllers-user')
const authVerify = require('./middleware/authVerify')
require('./utils/auth')

const app = express()
const PORT = process.env.PORT || 5000
dotenv.config()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(session({ secret: 'cats', resave: true, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session({ pauseStream: true }))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use('/api/users', routerUser)
app.use('/api/posts', authVerify, routerPost)
app.use('/auth/google', googleAuthRoutes)
app.use(ejsRouterPost)
app.use(ejsRouterUser)

app.use(async (req, res, next) => {
  res.header('X-Jelajah-Nusantara', 'Jelajah Nusantara API')

  next()
})

app.get('/', async (req, res) => {
  const webLink = process.env.BASE_URL || 'http://localhost:5000/web'
  try {
    res.status(200).json({ message: 'Welcome to Jelajah Nusantara API', web: webLink })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.use('/register', registerUser)

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' })
    }
    return res.status(200).json({ message: 'Logout successful' })
  })
})

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' })
})

app.listen(PORT, () => {
  console.log(`[⚡ server] Listening on url http://localhost:${PORT}`)
})
