const express = require('express')
const passport = require('passport')

const router = express.Router()

// Google Authentication Routes
router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get(
  '/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google/failure' }),
  (req, res) => {
    try {
      const accessToken = req.user.accessToken
      console.log('accessToken', accessToken)
      res.json({ success: true, token: accessToken, user: req.user })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },
)

router.get('/failure', (req, res) => {
  res.status(401).json({ error: 'Failed to authenticate' })
})

module.exports = router
