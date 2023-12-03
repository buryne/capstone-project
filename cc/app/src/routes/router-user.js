const express = require('express')
const {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} = require('../controllers/controllers-user')

const router = express.Router()

router
  .get('/', getAllUsers)
  .get('/:id', getUserById)
  .patch('/:id', updateUserById)
  .delete('/:id', deleteUserById)

module.exports = router
