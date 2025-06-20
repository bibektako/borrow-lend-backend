const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../../controllers/categoryController"); // Adjust the path as needed
const {
  categoryValidationRules,
  validateCategory,
} = require("../../middlewares/categoryValidator"); // Adjust path as needed


// --- Auth Middleware (Placeholder) ---
// This should be replaced with your actual authentication and authorization logic.
const auth = (req, res, next) => {
  if (req.headers.authorization) {
    // In a real app, you would verify a token and fetch user details here.
    req.user = { id: "someUserId", role: "admin" };
    next();
  } else {
    // For protected routes, you'd typically send an error if no auth is present.
    // We'll let the isAdmin middleware handle that.
    next();
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access required." });
  }
};


// --- Category Routes ---

// POST /api/categories - Create a new category
// Validation is necessary here to check the incoming data.
router.post(
  "/category",
  auth,
  isAdmin,
  categoryValidationRules(), // The function must be invoked here
  validateCategory,
  createCategory
);

// GET /api/categories - Get all categories
// No validation is needed to fetch a list of all categories.
router.get("/category", getAllCategories);

// GET /api/categories/:id - Get a single category
// No validation of the request body is needed here.
router.get("/category/:id", getCategoryById);

// PUT /api/categories/:id - Update an existing category
// Validation is necessary to check the incoming update data.
router.put(
  "/category/:id",
  auth,
  isAdmin,
  categoryValidationRules(), // The function must be invoked here
  validateCategory,
  updateCategory
);

// DELETE /api/categories/:id - Delete a category
// No validation of the request body is needed here.
router.delete(
  "/category/:id",
  auth,
  isAdmin,
  deleteCategory
);

module.exports = router;
