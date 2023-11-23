// This Routes file is for the user routes
const express = require("express")
const {
  getRiders,
  createRiders,
  updateRiderById,
} = require("../controllers/controllers-riders")

const router = express.Router()

router.get("/f1", getRiders)
router.post("/f1", createRiders)
router.patch("/f1/:id", updateRiderById)

module.exports = router
