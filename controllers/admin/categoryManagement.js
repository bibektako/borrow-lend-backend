const Category = require("../../models/Category");
const fs = require("fs");
const path = require("path");

exports.createCategory = async (req, res) => {
  const { name } = req.body;

  const imagePath = req.file ? req.file.path : null;

  if (!name) {
    return res.status(400).json({ message: "Category name is required." });
  }

  try {
    const newCategory = new Category({
      name: name,
      imageUrl: imagePath,
    });

    await newCategory.save();

    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while creating category.",
      error: error.message,
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.json({
      success: true,
      count: categories.length,
      data: categories,
      message: "All categories fetched",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    return res.json({
      success: true,
      data: category,
      message: "Category fetched",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newImageUrl = req.file ? req.file.path : req.body.imageUrl;

    const updateData = {};
    if (name) {
      updateData.name = name;
    }
    if (newImageUrl) {
      updateData.imageUrl = newImageUrl;
    }

    // Check if there is anything to update
    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No update data provided." });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    return res.json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({
          success: false,
          message: "A category with this name already exists.",
        });
    }
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    try {
      const filename = path.basename(category.imageUrl);
      const localImagePath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "uploads",
        filename
      );

      if (fs.existsSync(localImagePath)) {
        fs.unlinkSync(localImagePath);
        console.log(`Deleted image file: ${localImagePath}`);
      }
    } catch (fileError) {
      console.error(
        `Error deleting image file for category ${category._id}:`,
        fileError.message
      );
    }

    await Category.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Category and associated image deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
