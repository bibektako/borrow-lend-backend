const Notification = require("../models/Notification");

exports.createNotification = async (io, getUserSocket, notificationData) => {
  try {
    const newNotification = new Notification(notificationData);
    console.log(newNotification) ;
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
