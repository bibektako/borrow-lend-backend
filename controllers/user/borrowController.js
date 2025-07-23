const mongoose = require("mongoose");
const BorrowRequest = require("../../models/BorrowRequest");
const Item = require("../../models/Items");
const { createNotification } = require('../../service/notification_service');


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

        await createNotification(item.owner, borrowerId, 'new_request', { req, item });


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
    //   console.log("--- getBorrowRequests Controller Triggered ---");

    //   console.log("1. Raw req.user object:", req.user);

    const userIdString = req.user.id;
    //console.log("2. User ID string from req.user.id:", userIdString);

    const query = {
      $or: [
        { borrower: new mongoose.Types.ObjectId(userIdString) },
        { owner: new mongoose.Types.ObjectId(userIdString) },
      ],
    };
    console.log(
      "3. Mongoose query being sent to database:",
      JSON.stringify(query, null, 2)
    );

    const requests = await BorrowRequest.find(query)
      .populate("item", "name imageUrls")
      .populate("borrower", "username")
      .populate("owner", "username");

    // // 5. Log the result
    // console.log("4. Result from database query (requests found):", requests.length);
    // console.log("--- End of getBorrowRequests Controller ---");

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("!!! FATAL ERROR in getBorrowRequests:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateBorrowRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.requestId;
    const userId = req.user.id; // The user MAKING the change

    // ... (finding the request and item code is correct) ...
    const request = await BorrowRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found." });
    
    const item = await Item.findById(request.item);
    if (!item) return res.status(404).json({ message: "Associated item not found." });

    // --- PERMISSION CHECKS ---
    const isOwner = request.owner.equals(userId);
    const isBorrower = request.borrower.equals(userId);

    if (status === 'approved' || status === 'denied') {
      if (!isOwner) return res.status(403).json({ message: "Only the item owner can approve or deny." });
      if (request.status !== 'pending') return res.status(400).json({ message: "This request is no longer pending." });
    } 
    else if (status === 'returned') {
      if (!isBorrower) return res.status(403).json({ message: "Only the borrower can return an item." });
      if (request.status !== 'approved') return res.status(400).json({ message: "Only an approved item can be returned." });
    } 
    // --- THIS IS THE UPDATED LOGIC ---
    else if (status === 'cancelled') {
      // Scenario 1: Allow borrower to cancel a PENDING request.
      if (isBorrower && request.status === 'pending') {
        // This is a valid action, so we do nothing here and let the code proceed.
      }
      // Scenario 2: Allow owner to cancel an APPROVED request.
      else if (isOwner && request.status === 'approved') {
        // This is also a valid action, so we let it proceed.
      }
      // Scenario 3: All other cancellation attempts are forbidden.
      else {
        return res.status(403).json({ message: "You do not have permission to cancel this request in its current state." });
      }
    }

    // --- Update Status and Save ---
    request.status = status;
    
    if (status === 'approved') {
      item.status = 'borrowed';
    } else if (status === 'denied' || status === 'returned' || status === 'cancelled') {
      // When a request is cancelled, the item becomes available again.
      item.status = 'available';
    }

    await request.save();
    await item.save();
    
    // --- Trigger Notification ---
    let recipientId = null;
    if (status === 'approved' || status === 'denied') recipientId = request.borrower;
    else if (status === 'returned') recipientId = request.owner;
    else if (status === 'cancelled') recipientId = isOwner ? request.borrower : request.owner;

    if (recipientId) {
      await createNotification(recipientId, userId, status, { req, item });
    }
    
    res.status(200).json({ success: true, message: `Request status updated to ${status}.`, data: request });

  } catch (error) {
    console.error("Error updating borrow request:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
