const express = require('express')
const router = express.Router()
const {
  createUser,
  uploadPosts,
  getUserById,
  updateUserById,
  updatePostById,
  createPost,
} = require('../controllers/controllers-user')
const { getUsers } = require('../controllers/controllers-user')
const upload = require('../utils/multer')

router
  .get('/', getUsers)
  .get('/:id', getUserById)
  .post('/', createUser)
  .patch('/:id', updateUserById)
  .patch('/upload/:id', upload.single('image'), createPost)
  .patch('/posts/:id', updatePostById)

module.exports = router
