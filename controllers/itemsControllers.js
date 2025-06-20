const Item = require("../models/User"); // Assuming your model is in ../models/itemModel.js
const User = require("../models/User"); // Required for checking admin roles
const Category = require("../models/Category"); // Required for validation

// @desc    Create a new item
// @route   POST /api/items
// @access  Private (User must be logged in)
const createItem = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    // Basic validation
    if (!name || !description || !category) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    // Check if the category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found." });
    }

    // req.user.id should be available from an authentication middleware
    const newItem = new Item({
      name,
      description,
      category,
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while creating item." + error.message });
  }
};

// @desc    Get all items with filtering
// @route   GET /api/items
// @access  Public
const getAllItems = async (req, res) => {
  try {
    const { category, status, isVerified } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (isVerified) filter.isVerified = isVerified === "true";

    const items = await Item.find(filter)
      .populate("owner", "username location") // Populate owner's username and location
      .populate("category", "name"); // Populate category name

    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching items." });
  }
};

// @desc    Get a single item by ID
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("owner", "username location profile_picture_url")
      .populate("category", "name");

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching item." });
  }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private (Owner or Admin only)
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    // Check if the logged-in user is the owner of the item or an admin
    // req.user should be populated by auth middleware
    if (item.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "User not authorized to update this item." });
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the modified document rather than the original
      runValidators: true, // Run schema validators on update
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating item." });
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private (Owner or Admin only)
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    // Check if the user is the owner or an admin
    if (item.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "User not authorized to delete this item." });
    }

    await item.deleteOne(); // Use deleteOne() for Mongoose v6+

    res.status(200).json({ message: "Item successfully deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting item." });
  }
};

// @desc    Verify an item
// @route   PATCH /api/items/:id/verify
// @access  Private (Admin only)
const verifyItem = async (req, res) => {
  try {
    // This check can also be done in a dedicated admin middleware
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "User not authorized for this action." });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    item.isVerified = true;
    item.verifiedBy = req.user.id; // Store which admin verified it

    const updatedItem = await item.save();

    res
      .status(200)
      .json({ message: "Item verified successfully.", item: updatedItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while verifying item." });
  }
};

// Export all controller functions
module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  verifyItem,
};
