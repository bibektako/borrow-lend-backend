const mongoose = require("mongoose");

// Define the schema for the Item model
const itemSchema = new mongoose.Schema(
  {
    // The user who owns and is lending the item.
    // This creates a reference to the User model.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // This should match the name you use when creating the User model, e.g., mongoose.model('User', userSchema)
      required: false,
    },
    // The category the item belongs to.
    // This creates a reference to the Category model.
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // This should match the name of your Category model
      required: true,
    },
    // The name of the item.
    name: {
      type: String,
      required: true,
      trim: true, // Removes whitespace from both ends of a string.
    },
    // A detailed description of the item.
    description: {
      type: String,
      required: true,
    },
    // An array of URLs for the item's images. Storing multiple images is often useful.
    imageUrls: [
      {
        type: String,
      },
    ],
    // The current status of the item (e.g., whether it's available for borrowing).
    status: {
      type: String,
      enum: ["available", "borrowed", "requested"], // Defines the possible statuses
      default: "available", // The default status when an item is first created.
    },
    // A flag to indicate if an admin has verified the item.
    isVerified: {
      type: Boolean,
      default: false,
    },
    // The admin who verified the item.
    // This is also a reference to the User model.
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Should reference a user with an 'admin' role
    },
  },
  {
    // This option automatically adds `createdAt` and `updatedAt` fields
    // to the schema, which is great for tracking when documents are created or modified.
    timestamps: true,
  }
);

// Create the Item model from the schema
const Item = mongoose.model("Item", itemSchema);

// Export the model so it can be used in other parts of your application
module.exports = Item;
