// /controllers/user/borrowController.js

const mongoose = require("mongoose");
const BorrowRequest = require("../../models/BorrowRequest");
const Item = require("../../models/Items"); // Corrected model name from "Items" to "Item" if singular
const { createNotification } = require('../../service/notification_service');

exports.createBorrowRequest = async (req, res) => {
  const io = req.app.get('socketio');
  const getUserSocket = req.app.get('getUserSocket');
    console.log("Is the 'io' object defined?", io !== undefined);


  try {
    const itemId = req.params.itemId;
    const borrowerId = req.user.id;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (item.owner.toString() === borrowerId) {
      return res.status(400).json({ message: "You cannot borrow your own item." });
    }

    if (item.status !== "available") {
      return res.status(400).json({ message: "Item is not available for borrowing." });
    }

    const newRequest = new BorrowRequest({
      item: new mongoose.Types.ObjectId(itemId),
      borrower: new mongoose.Types.ObjectId(borrowerId),
      owner: item.owner,
    });
    await newRequest.save();

    item.status = "requested";
    await item.save();

    // --- THE FIX ---
    // 1. Construct a proper notification OBJECT.
    const notificationData = {
      recipient: item.owner,
      sender: borrowerId,
      type: 'new_request',
      message: `You have a new request for your item: "${item.name}"`,
      link: `/requests/${newRequest._id}` // Example link
    };

    // 2. Call the service with the CORRECT arguments.
    await createNotification(io, getUserSocket, notificationData);

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
    const userIdString = req.user.id;
    const query = {
      $or: [
        { borrower: new mongoose.Types.ObjectId(userIdString) },
        { owner: new mongoose.Types.ObjectId(userIdString) },
      ],
    };

    const requests = await BorrowRequest.find(query)
      .populate("item", "name imageUrls")
      .populate("borrower", "username")
      .populate("owner", "username");

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error in getBorrowRequests:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateBorrowRequestStatus = async (req, res) => {
  // Get io and getUserSocket from the request object
  const io = req.app.get('socketio');
  const getUserSocket = req.app.get('getUserSocket');
  
  try {
    const { status } = req.body;
    const requestId = req.params.requestId;
    const userId = req.user.id; // The user MAKING the change

    const request = await BorrowRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found." });
    
    const item = await Item.findById(request.item);
    if (!item) return res.status(404).json({ message: "Associated item not found." });

    // --- PERMISSION CHECKS (Your logic is good) ---
    const isOwner = request.owner.equals(userId);
    const isBorrower = request.borrower.equals(userId);


    request.status = status;
    
    if (status === 'approved') item.status = 'borrowed';
    else if (status === 'denied' || status === 'returned' || status === 'cancelled') item.status = 'available';

    await request.save();
    await item.save();
    
    let recipientId = null;
    if (status === 'approved' || status === 'denied') recipientId = request.borrower;
    else if (status === 'returned') recipientId = request.owner;
    else if (status === 'cancelled') recipientId = isOwner ? request.borrower : request.owner;

    if (recipientId) {
      const notificationData = {
        recipient: recipientId,
        sender: userId,
        type: status,
        message: `Your request for "${item.name}" has been updated to: ${status}.`,
        link: `/requests/${request._id}`
      };
      
      await createNotification(io, getUserSocket, notificationData);
    }
    
    res.status(200).json({ success: true, message: `Request status updated to ${status}.`, data: request });

  } catch (error) {
    console.error("Error updating borrow request:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};