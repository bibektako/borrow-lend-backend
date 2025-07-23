const Notification = require('../models/Notification');
const User = require('../models/User'); // Make sure path to User model is correct

/**
 * Creates and saves a notification, and emits a real-time event.
 * @param {string} recipientId - The ID of the user to notify.
 * @param {string} senderId - The ID of the user who triggered the event.
 * @param {string} type - The type of notification.
 * @param {object} options - Contains { req, item (optional) } to access socket.io and item details.
 */
exports.createNotification = async (recipientId, senderId, type, options = {}) => {
  try {
    const { req, item } = options;
    const sender = await User.findById(senderId);
    if (!sender) throw new Error('Sender not found');

    let message = '';
    switch (type) {
      case 'new_request':
        message = `${sender.username} wants to borrow your item: ${item.name}`;
        break;
      case 'approved':
        message = `Your borrow request for "${item.name}" was approved.`;
        break;
      case 'denied':
        message = `Your borrow request for "${item.name}" was denied.`;
        break;
      case 'cancelled':
         // We can be more specific based on who cancelled if needed
        message = `A borrow request for "${item.name}" was cancelled.`;
        break;
      case 'returned':
        message = `${sender.username} has marked "${item.name}" as returned.`;
        break;
      default:
        return; // Do not create a notification for unknown types
    }

    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
    });

    await notification.save();

    // --- Real-time Part ---
    if (req && req.app) {
      const io = req.app.get('socketio');
      const getUserSocket = req.app.get('getUserSocket');
      const recipientSocket = getUserSocket(recipientId.toString());

      if (recipientSocket) {
        io.to(recipientSocket.socketId).emit('getNotification', {
            message,
            sender: { username: sender.username },
            createdAt: notification.createdAt
        });
      }
    }

  } catch (error) {
    console.error('Error in notification service:', error);
  }
};
