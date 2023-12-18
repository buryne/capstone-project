const express = require('express')
const {
  getAllUsers,
  getUserById,
  // ! OFF FEATURE
  // updateUserById,
  deleteUserById,
} = require('../controllers/controllers-user')

const router = express.Router()

router
  .get('/', getAllUsers)
  .get('/:id', getUserById)
  .delete('/:id', deleteUserById)

module.exports = router
