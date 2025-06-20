const Category = require('../models/Category'); // Assuming your model is in ../models/categoryModel.js

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private (Admin only)
const createCategory = async (req, res) => {
  try {
    // Check if the user is an admin. This logic assumes you have an auth middleware
    // that adds the user object (with a 'role' property) to the request.
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized. Admin access required.' });
    }

    const { name, imageUrl } = req.body;

    // Basic validation
    if (!name || !imageUrl) {
      return res.status(400).json({ message: 'Please provide a name and an image URL.' });
    }

    // Check if the category already exists
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(409).json({ message: 'A category with this name already exists.' });
    }

    // Create a new category
    const category = new Category({
      name,
      imageUrl,
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating category.' });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching categories.' });
  }
};

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        res.status(200).json(category);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching category.' });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
const updateCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized. Admin access required.' });
    }
    
    const { name, imageUrl } = req.body;
    
    const category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
    }

    // Check for name uniqueness if the name is being changed
    if (name && name !== category.name) {
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return res.status(409).json({ message: 'A category with this name already exists.' });
        }
    }

    category.name = name || category.name;
    category.imageUrl = imageUrl || category.imageUrl;

    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating category.' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized. Admin access required.' });
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // Optional: Before deleting a category, you might want to handle items associated with it.
    // For example, reassign them to a default category or prevent deletion if items exist.
    // const itemsInCategory = await Item.countDocuments({ category: req.params.id });
    // if (itemsInCategory > 0) {
    //   return res.status(400).json({ message: 'Cannot delete category. It contains items.' });
    // }

    await category.deleteOne();

    res.status(200).json({ message: 'Category successfully deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting category.' });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
