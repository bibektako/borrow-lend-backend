const Notification = require('../models/Notification');

exports.createNotification = async (req, notificationData) => {
  try {
    const io = req.app.get('socketio');
    const getUserSocket = req.app.get('getUserSocket');

    const newNotification = new Notification(notificationData);
    await newNotification.save();

    const recipientSocket = getUserSocket(notificationData.recipient.toString());

    if (recipientSocket) {
      io.to(recipientSocket.socketId).emit('newNotification', newNotification);
      console.log(`Notification sent to user ${notificationData.recipient}`);
    } else {
      console.log(`User ${notificationData.recipient} is offline. Notification saved.`);
    }

  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};