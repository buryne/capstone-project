const express = require('express')
const passport = require('passport')
const cors = require('cors')
const session = require('express-session')
const { firebase, storage } = require('./utils/firebase.js')
require('./utils/auth.js')

const app = express()

app.use(cors())
app.use(express.json())
app.use(session({ secret: 'cats' }))
app.use(passport.initialize())
app.use(passport.session({ pauseStream: true }))
app.use(express.urlencoded({ extended: true }))

function isLoggedIn(req, res, next) {
  req.user ? next() : res.redirect('/')
}

const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

app.post('/login', async (req, res) => {
  try {
    const userResponse = await auth.createUser({
      displayName: req.body.displayName,
      email: req.body.email,
      password: req.body.password,
      emailVerified: false,
    })

    await saveUserToFirestore(userResponse)

    res.status(200).json(userResponse)
  } catch (error) {
    console.error('Error creating user and saving to Firestore:', error)
    res.status(500).send('Internal Server Error')
  }
})

app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Login With Google</a>')
})

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

app.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/google/failure',
  })
)

app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..')
})

app.get('/protected', isLoggedIn, (req, res) => {
  res.send(
    `<div><h1>Hello ${req.user.displayName}</h1><img src="${
      req.user.photoURL
    }" width="200" /><pre><code>
    ${JSON.stringify(req.user, null, 4)}
    </code></pre><pre><code>
    ${JSON.stringify(req.authInfo, null, 4)}
    </code></pre></div>`
  )
})

app.get('/logout', (req, res) => {
  req.session = null
  req.logout()
  res.redirect('/')
})

app.listen(5000, () => {
  console.log('Server running on port 5000')
})

// function extractUserData(userResponse) {
//   return {
//     uid: userResponse.uid,
//     displayName: userResponse.displayName,
//     email: userResponse.email,
//     emailVerified: userResponse.emailVerified,
//     posts: [],
//     // Add other relevant properties as needed
//   }
// }

// async function saveUserToFirestore(userResponse) {
//   const userData = extractUserData(userResponse)
//   const userRef = await db.collection('users').add(userData)
//   return userRef
// }
