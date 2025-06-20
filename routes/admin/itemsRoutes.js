const express = require("express");
const router = express.Router();
const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  verifyItem,
} = require("../../controllers/itemsControllers"); // Adjust path as needed
const Item = require("../../models/Items"); // Required for ownership check

// --- Auth Middleware (Placeholders) ---
// You will replace these with your actual authentication logic.

const auth = (req, res, next) => {
  // In a real app, verify a JWT and attach the user object to the request.
  if (req.headers.authorization) {
    req.user = { id: "someUserId", role: "admin" }; // Simulate an admin for testing all routes
    // For testing a normal user: req.user = { id: 'someOtherUserId', role: 'normal' };
    next();
  } else {
    // For public routes this is fine, for protected routes it will fail at the next step.
    next();
  }
};

const isOwnerOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (item.owner.toString() === req.user.id || req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "User not authorized for this action." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during authorization." });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access required." });
  }
};

// --- Item Routes ---

router.post("/item", createItem);

router.get("/", getAllItems);

router.get("/:id", getItemById);

router.put("/:id", auth, isOwnerOrAdmin, updateItem);

router.delete("/:id", auth, isOwnerOrAdmin, deleteItem);

router.patch("/:id/verify", auth, isAdmin, verifyItem);

module.exports = router;
