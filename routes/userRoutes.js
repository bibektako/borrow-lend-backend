const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUser} = require("../controllers/userControllers");
const { userValidationRules, validate} = require("../middlewares/userValidation")
const { authenticateUser } = require("../middlewares/authorizedUser") // Or wherever it's located



router.post(
  "/register",
  userValidationRules(), 
  validate,
  registerUser
);

router.post(
  "/login",
  loginUser
);

router.get(
  "/me",
  authenticateUser,
  getUser
)

module.exports = router;
