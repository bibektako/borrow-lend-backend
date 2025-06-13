const { body, validationResult } = require("express-validator");

const userValidationRules = () => {
  return [
    // Username validation
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters"),

    // Email validation
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please enter a valid email address")
      .normalizeEmail(), // Sanitizes email (lowercase)

    // Phone validation
    body("phone")
      .notEmpty()
      .withMessage("Phone number is required")
      .isNumeric()
      .withMessage("Phone number must be numeric")
      .isLength({ min: 10, max: 10 })
      .withMessage("Phone number must be 10 digits"),

    // Password validation
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage(
        "Password must contain at least one letter, one number, and one special character"
      ),

    // Location (optional)
    body("location")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Location cannot exceed 100 characters"),

    // Bio (optional)
    body("bio")
      .optional()
      .trim()
      .isLength({ max: 202 })
      .withMessage("Bio cannot exceed 200 characters"),

    body("items")
      .optional()
      .withMessage("items must not be empty")
      .custom((value) => {
        if (!value.every((id) => mongoose.isValidObjectId(id))) {
          throw new Error("All items entries must be valid ObjectIds");
        }
        return true;
      }),
    
    body("role")
      .optional()
      .isIn(["normal", "admin", "moderator"])
      .withMessage("Role must be one of: normal, admin, moderator")
  ];
};


const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { userValidationRules, validate };