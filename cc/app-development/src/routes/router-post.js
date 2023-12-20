const express = require('express')
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePostById,
} = require('../controllers/controllers-post')
const upload = require('../utils/multer')

const router = express.Router()

router
  .get('/', getAllPosts)
  .get('/:id', getPostById)
  .post('/', upload.single('image'), createPost)
  .patch('/:id', updatePost)
  .delete('/:id', deletePostById)

module.exports = router
