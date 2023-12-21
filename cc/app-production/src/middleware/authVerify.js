const asyncHandler = require('express-async-handler')
const { firebase } = require('../utils/firebase')

const authVerify = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = await firebase.auth().verifyIdToken(token)
    const uid = decodedToken.uid
    console.log('uid', uid)
    req.user = decodedToken
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid Token' })
  }
})

module.exports = authVerify
