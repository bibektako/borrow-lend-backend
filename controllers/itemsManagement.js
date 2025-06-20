// Correctly import all necessary models
const Item = require("../models/Items");     
const User = require("../models/User");     
const Category = require("../models/Category"); 


const createItem = async (req, res) => {
  console.log("Reached createItem controller");
  res.send("Item created");
  try {
    
    const { name, description, category, borrowingPrice } = req.body;

 
    if (!name || !description || !category || borrowingPrice === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all required fields." });
    }
    
   
    const imageUrls = req.files ? req.files.map(file => file.path) : [];
    if (imageUrls.length === 0) {
        return res.status(400).json({ success: false, message: "At least one image is required." });
    }

    // Check if the category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    // req.user.id is made available from the authentication middleware
    const newItem = new Item({
      name,
      description,
      category,
      borrowingPrice,
      imageUrls,
      owner: req.user.id, // Assign owner from authenticated user
    });

    const savedItem = await newItem.save();
    res.status(201).json({ success: true, data: savedItem, message: "Item created successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error while creating item.", error: error.message });
  }
};


const getAllItems = async (req, res) => {
  try {
    const { category, status, isVerified, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' }; 
    
    
    if (isVerified !== undefined) {
        filter.isVerified = isVerified === "true";
    }

    const items = await Item.find(filter)
      .populate("owner", "username location") 
      .populate("category", "name"); 

    res.status(200).json({ success: true, count: items.length, data: items, message: "Items fetched successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error while fetching items." });
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("owner", "username","location") 
      .populate("category", "name");

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error while fetching item." });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    if (item.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "User not authorized to update this item." });
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true, 
      runValidators: true, 
    });

    res.status(200).json({ success: true, data: updatedItem, message: "Item updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error while updating item." });
  }
};


const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    if (item.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "User not authorized to delete this item." });
    }

    await item.deleteOne();

    res.status(200).json({ success: true, message: "Item successfully deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error while deleting item." });
  }
};


const verifyItem = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "User not authorized for this action." });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    item.isVerified = true;
    

    const updatedItem = await item.save();

    res
      .status(200)
      .json({ success: true, message: "Item verified successfully.", data: updatedItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error while verifying item." });
  }
};


module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  verifyItem,
};
