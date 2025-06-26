const express = require("express")
const router = express.Router()
const {createReview, getallReviews, getReviewById, updateOneReview, deleteOneReview} = require("../controllers/user/reviewManagement")

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
router.put(
    "/:id",
    updateOneReview
)
router.delete(
    "/:id",
    deleteOneReview
)

module.exports = router