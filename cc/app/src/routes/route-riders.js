// This Routes file is for the user routes
const express = require('express');
const {
  getRiders,
  createRiders,
  updateRiderById,
} = require('../controllers/controllers-riders');
const upload = require('../utils/multer');

const router = express.Router();

router.get('/f1', getRiders);
router.post('/f1', createRiders);
router.patch('/f1/:id', upload.single('image'), updateRiderById);

module.exports = router;
