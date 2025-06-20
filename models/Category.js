const mongoose = require('mongoose');

// Define the schema for the Category model
const categorySchema = new mongoose.Schema(
  {
    // The name of the category. It should be unique.
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // URL for the category's image.
    imageUrl: {
      type: String,
      required: true,
    },
  },
  {
    
    timestamps: true,
  }
);

// Create the Category model from the schema
const Category = mongoose.model('Category', categorySchema);

// Export the model
module.exports = Category;
