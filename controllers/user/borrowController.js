const mongoose = require("mongoose");
const BorrowRequest = require("../../models/BorrowRequest");
const Item = require("../../models/Items");

exports.createBorrowRequest = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const borrowerId = req.user.id;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (item.owner.toString() === borrowerId) {
      return res
        .status(400)
        .json({ message: "You cannot borrow your own item." });
    }

    if (item.status !== "available") {
      return res
        .status(400)
        .json({ message: "Item is not available for borrowing." });
    }

    const newRequest = new BorrowRequest({
      item: new mongoose.Types.ObjectId(itemId),
      borrower: new mongoose.Types.ObjectId(borrowerId),
      owner: item.owner, 
    });

    await newRequest.save();

    item.status = "requested";
    await item.save();

    res.status(201).json({
      success: true,
      message: "Borrow request sent successfully.",
      data: newRequest,
    });
  } catch (error) {
    console.error("Error creating borrow request:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getBorrowRequests = async (req, res) => {
  try {
    // --- DETAILED DEBUGGING LOGS ---
    console.log("--- getBorrowRequests Controller Triggered ---");
    
    // 1. Log the raw user object from the token
    console.log("1. Raw req.user object:", req.user);
    
    // 2. Log the raw user ID string
    const userIdString = req.user.id;
    console.log("2. User ID string from req.user.id:", userIdString);

    // 3. Create the query object
    const query = {
      $or: [
        { borrower: new mongoose.Types.ObjectId(userIdString) },
        { owner: new mongoose.Types.ObjectId(userIdString) },
      ],
    };
    console.log("3. Mongoose query being sent to database:", JSON.stringify(query, null, 2));

    // 4. Execute the query
    const requests = await BorrowRequest.find(query)
      .populate("item", "name imageUrls")
      .populate("borrower", "username")
      .populate("owner", "username");

    // 5. Log the result
    console.log("4. Result from database query (requests found):", requests.length);
    console.log("--- End of getBorrowRequests Controller ---");

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("!!! FATAL ERROR in getBorrowRequests:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// exports.getBorrowRequests = async (req, res) => {
//   try {
//       const userId = new mongoose.Types.ObjectId(req.user.id);
//     console.log("Backend: Searching for requests for user ID:", userId);

//     const requests = await BorrowRequest.find({
//       $or: [{ borrower: userId }, { owner: userId }],
//     })
//       .populate("item", "name imageUrls")
//       .populate("borrower", "username")
//       .populate("owner", "username");

//     console.log("Backend: Found requests:", requests);

//     res.status(200).json({ success: true, data: requests });
//   } catch (error) {
//     console.error("Error fetching borrow requests:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

exports.updateBorrowRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.requestId;
    const userId = req.user.id;

    if (!["approved", "denied"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update." });
    }

    const request = await BorrowRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (request.owner.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this request." });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({
          message: "This request is no longer pending and cannot be updated.",
        });
    }

    request.status = status;
    await request.save();

    const item = await Item.findById(request.item);
    if (status === "approved") {
      item.status = "borrowed";
    } else {
      // Denied
      item.status = "available";
    }
    await item.save();

    res
      .status(200)
      .json({ success: true, message: `Request ${status}.`, data: request });
  } catch (error) {
    console.error("Error updating borrow request:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
