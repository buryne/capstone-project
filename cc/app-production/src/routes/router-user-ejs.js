const express = require('express')
const { getUserById } = require('../controllers/controllers-user-ejs')

const router = express.Router()

router.get('/my-posts/user/:id', getUserById)

module.exports = router
