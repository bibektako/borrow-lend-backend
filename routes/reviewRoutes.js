const express = require("express")
const router = express.Router()
const {createReview, getallReviews, getReviewById, updateOneReview, deleteOneReview} = require("../controllers/user/reviewManagement")
const { authenticateUser } = require("../middlewares/authorizedUser")

router.post(
    "/create",
    authenticateUser,
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
    authenticateUser,
    updateOneReview
)
router.delete(
    "/:id",
    deleteOneReview
)

module.exports = router