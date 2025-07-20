const Item = require("../models/Items");
const User = require("../models/User");
const Category = require("../models/Category");

const createItem = async (req, res) => {
  console.log("Reached createItem controller");
  res.send("Item created");
  try {
    const { name, description, category, borrowingPrice } = req.body;

    if (!name || !description || !category || borrowingPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const imageUrls = req.files ? req.files.map((file) => file.path) : [];
    if (imageUrls.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required." });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    const newItem = new Item({
      name,
      description,
      category,
      borrowingPrice,
      imageUrls,
      owner: req.user.id,
      // location: req.user.location
    });

    const savedItem = await newItem.save();
    res.status(201).json({
      success: true,
      data: savedItem,
      message: "Item created successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while creating item.",
      error: error.message,
    });
  }
};

const getAllItems = async (req, res) => {

  try {
    const { categories, status, isVerified, search, price, rating, location } = req.query;

    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'ownerDetails'
        }
      },
      { $unwind: "$ownerDetails" },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'item_id',
          as: 'reviewsData'
        }
      },
      {
        $addFields: {
          numReviews: { $size: '$reviewsData' },
          averageRating: { $ifNull: [{ $avg: '$reviewsData.rating' }, 0] }
        }
      },
      {
        $match: {
          ...(search && { name: { $regex: search, $options: 'i' } }),
          ...(status && { status: status }),
          ...(isVerified !== undefined && { isVerified: isVerified === 'true' }),
          ...(price && { borrowingPrice: { $lte: Number(price) } }),
          ...(rating && { averageRating: { $gte: Number(rating) } }),
          ...(categories && { category: { $in: Array.isArray(categories) ? categories : [categories] } }),
          ...(location && { 'ownerDetails.location': { $regex: location, $options: 'i' } })
        }
      },
      {
          $addFields: {
              averageRating: { $round: ['$averageRating', 1] }
          }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: "$categoryDetails" },

      {
        $project: {
          name: 1,
          description: 1,
          imageUrls: 1,
          borrowingPrice: 1,
          status: 1,
          isVerified: 1,
          createdAt: 1,
          updatedAt: 1,
          numReviews: 1, // Keep the calculated numReviews

          rating: '$averageRating', // Create 'rating' from 'averageRating'

          owner: {
            _id: '$ownerDetails._id',
            username: '$ownerDetails.username',
            location: '$ownerDetails.location'
          },

          category: {
             _id: '$categoryDetails._id',
             name: '$categoryDetails.name'
          }
        }
      }
    ];

    const items = await Item.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      message: "Items fetched successfully.",
    });

  } catch (error) {
    console.error(error); // Log the detailed error
    res.status(500).json({
      success: false,
      message: "Server error while fetching items."
    });
  }
};


const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("owner", "username location")
      .populate("category", "name");

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching item." });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });
    }
    const { name, description, category, borrowingPrice } = req.body;
    if (name) item.name = name;
    if (description) item.description = description;
    if (category) item.category = category;
    if (borrowingPrice) item.borrowingPrice = borrowingPrice;

     if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map((file) => file.path);
      item.imageUrls = newImageUrls;
    }

    const updateItem = await item.save();

    if (item.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "User not authorized to update this item.",
      });
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedItem,
      data:updateItem,
      message: "Item updated successfully.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error while updating item." });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });
    }

    if (item.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "User not authorized to delete this item.",
      });
    }

    await item.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Item successfully deleted." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error while deleting item." });
  }
};

const verifyItem = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "User not authorized for this action.",
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });
    }

    item.isVerified = true;

    const updatedItem = await item.save();

    res.status(200).json({
      success: true,
      message: "Item verified successfully.",
      data: updatedItem,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error while verifying item." });
  }
  };

const getMyItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await Item.find({ owner: userId }).populate(
      "category",
      "name"
    );

    if (!items) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No items found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      data: items,
      message: "User's items fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching user's items:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user's items.",
      error: error.message,
    });
  }
};





module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  verifyItem,
  getMyItems,
  
};
