const express = require('express')
const {
  getAllPosts,
  getPostById,
  createPost,
  deletePostById,
  updatePostById,
} = require('../controllers/controllers-post')
const upload = require('../utils/multer')

const router = express.Router()

router
  .get('/', getAllPosts)
  .get('/:id', getPostById)
  .post('/', upload.single('image'), createPost)
  .patch('/:id', updatePostById)
  .delete('/:id', deletePostById)

module.exports = router
