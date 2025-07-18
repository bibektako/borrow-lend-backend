const mongoose = require("mongoose");

const borrowRequestSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "denied", "returned", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BorrowRequest", borrowRequestSchema);
