const express = require("express")
const router = express.Router()
const {createReview} = require("../controllers/user/reviewManagement")

router.post(
    "/create",
    createReview
)

module.exports = router