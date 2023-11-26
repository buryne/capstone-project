const express = require('express')
const router = express.Router()
const {
  createUser,
  uploadPosts,
  getUserById,
} = require('../controllers/controllers-user')
const { getUsers } = require('../controllers/controllers-user')
const upload = require('../utils/multer')

router
  .get('/', getUsers)
  .get('/:id', getUserById)
  .post('/', createUser)
  .patch('/:id')
  .patch('/upload/:id', upload.single('image'), uploadPosts)

module.exports = router
