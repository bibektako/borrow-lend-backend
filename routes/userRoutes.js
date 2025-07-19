const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUser,
  addBookmark,
  removeBookmark,
  getBookmarks,
} = require("../controllers/userControllers");
const {
  userValidationRules,
  validate,
} = require("../middlewares/userValidation");
const { authenticateUser } = require("../middlewares/authorizedUser");

router.post("/register", userValidationRules(), validate, registerUser);

router.post("/login", loginUser);

router.get("/me", authenticateUser, getUser);
router.route("/bookmarks").get(authenticateUser, getBookmarks);

router
  .route("/bookmarks/:itemId")
  .post(authenticateUser, addBookmark)
  .delete(authenticateUser, removeBookmark);

module.exports = router;
