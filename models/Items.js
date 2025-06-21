const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    imageUrls: [
      {
        type: String,
        required: true,
      },
    ],
    borrowingPrice: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative."],
      default: 0,
    },

    status: {
      type: String,
      enum: ["available", "borrowed", "requested"],
      default: "available",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", itemSchema);
