const express = require("express");
const router = express.Router();
const {
  createBorrowRequest,
  getBorrowRequests,
  updateBorrowRequestStatus,
} = require("../controllers/user/borrowController")
const { authenticateUser } = require("../middlewares/authorizedUser")
const BorrowRequest = require("../models/BorrowRequest");

router.use(authenticateUser);

router.post("/request/:itemId", createBorrowRequest);

router.get("/requests", getBorrowRequests);

router.patch("/request/:requestId", updateBorrowRequestStatus);

module.exports = router;
