const { body, validationResult } = require('express-validator');
const Category = require('../models/Category'); // Adjust path as needed

const categoryValidationRules = () => {
  return [
    // Rule for the category name
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required.')
      // Custom validator to check for uniqueness, now using the `req` object
      .custom(async (name, { req }) => {
        // Build a query to find a category with the same name.
        const query = { name: name };

        // If we are updating a category, an ID will be present in the request params.
        // We need to exclude the current category from the uniqueness check.
        if (req.params.id) {
          query._id = { $ne: req.params.id }; // $ne means "not equal"
        }

        const categoryExists = await Category.findOne(query);
        
        if (categoryExists) {
          // If a conflicting category is found, reject the promise.
          return Promise.reject('A category with this name already exists.');
        }
      }),

    // Rule for the image URL
    body('imageUrl')
      .notEmpty()
      .withMessage('Image URL is required.')
      .isURL()
      .withMessage('Please provide a valid image URL.'),
  ];
};

// Middleware to handle the result of the validation
// This function already uses `req` and `res` correctly.
const validateCategory = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If there are validation errors, send a 400 response with the errors
    return res.status(400).json({ errors: errors.array() });
  }
  // If validation passes, proceed to the next middleware (the controller)
  next();
};

module.exports = { categoryValidationRules, validateCategory };
