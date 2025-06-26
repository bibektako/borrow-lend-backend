const express = require("express")
const router = express.Router()
const {createReview, getallReviews, getReviewById} = require("../controllers/user/reviewManagement")

router.post(
    "/create",
    createReview
)
router.get(
    "/",
    getallReviews
)
router.get(
    "/:id",
    getReviewById
)

module.exports = router