const express = require("express");

const router = express.Router();
const { registerUser, loginUser } = require("../controllers/userControllers");
const { userValidationRules, validate} = require("../middlewares/userValidation")

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
module.exports = router;
