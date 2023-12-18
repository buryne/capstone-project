const asyncHandler = require('express-async-handler')

const isLoggedIn = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res
    .status(401)
    .json({
      error: 'Unauthorized',
      message: 'Please log in to access this API.',
    })
})

module.exports = { isLoggedIn }
