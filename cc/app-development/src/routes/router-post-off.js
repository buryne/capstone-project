const express = require('express')
const {
  getAllPosts,
  getPostById,
  updatePostById,
  deletePostById,
  createPost,
} = require('../controllers/controllers-post-off')
const upload = require('../utils/multer')

const router = express.Router()

router
  .get('/', getAllPosts)
  .get('/:id', getPostById)
  .post('/', upload.single('image'), createPost)
  .patch('/:id', updatePostById)
  .delete('/:id', deletePostById)

module.exports = router
